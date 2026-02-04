import { useState, useEffect, useCallback } from 'react'
import { isNativePlatform, getPlatform } from './use-storage'

// Product IDs - these should match what's configured in App Store Connect and Google Play Console
// Format: com.tilecalculator.app.animal_<id>
export const PRODUCT_IDS: Record<number, string> = {
  9: 'com.tilecalculator.animal_griffin',      // Griffin - $2.99
  10: 'com.tilecalculator.animal_cthulhu',     // Cthulhu - $3.99
  13: 'com.tilecalculator.animal_sasquatch',   // Sasquatch - $4.99
  14: 'com.tilecalculator.animal_lizardking',  // Lizard King - $5.99
  15: 'com.tilecalculator.animal_zombie',      // Zombie - $3.49
  16: 'com.tilecalculator.animal_trex',        // T-Rex - $4.49
  18: 'com.tilecalculator.animal_anglerfish',  // Anglerfish - $3.99
  19: 'com.tilecalculator.animal_shark',       // Shark - $3.99
  20: 'com.tilecalculator.animal_whale',       // Whale - $4.99
  21: 'com.tilecalculator.animal_mousepat',    // Mouse Pat - $3.99
}

// RevenueCat API keys
// Note: RevenueCat typically provides separate keys for Android and iOS
// For now, using the same key for both - update if you have platform-specific keys
const REVENUECAT_API_KEYS = {
  android: 'test_fQyYuyDJUszyZRRfwEvjtjRmdYP',
  ios: 'test_fQyYuyDJUszyZRRfwEvjtjRmdYP',
}

interface PurchaseResult {
  success: boolean
  error?: string
}

interface UsePurchasesReturn {
  isInitialized: boolean
  isPurchasing: boolean
  purchaseAnimal: (animalId: number, animalName: string, price: number) => Promise<PurchaseResult>
  restorePurchases: () => Promise<number[]> // Returns array of purchased animal IDs
}

/**
 * Hook for handling in-app purchases.
 * - On Spark/web: Uses fake purchase flow (instant success)
 * - On Native: Uses RevenueCat for real in-app purchases
 */
export function usePurchases(): UsePurchasesReturn {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const isNative = isNativePlatform()
  const platform = getPlatform()

  // Initialize RevenueCat on native platforms
  useEffect(() => {
    const initializePurchases = async () => {
      if (!isNative) {
        // Web/Spark - no initialization needed
        setIsInitialized(true)
        return
      }

      try {
        // Dynamically import RevenueCat only on native platforms
        const { Purchases } = await import('@revenuecat/purchases-capacitor')
        
        const apiKey = platform === 'android' 
          ? REVENUECAT_API_KEYS.android 
          : REVENUECAT_API_KEYS.ios

        // Check if already configured
        try {
          await Purchases.configure({ apiKey })
          console.log('RevenueCat initialized successfully')
        } catch (configError) {
          console.log('RevenueCat may already be configured:', configError)
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error)
        // Still mark as initialized so the app can function
        // Purchases will fail but app won't be blocked
        setIsInitialized(true)
      }
    }

    initializePurchases()
  }, [isNative, platform])

  // Purchase an animal
  const purchaseAnimal = useCallback(async (
    animalId: number, 
    animalName: string, 
    price: number
  ): Promise<PurchaseResult> => {
    setIsPurchasing(true)

    try {
      if (!isNative) {
        // Spark/Web: Fake purchase flow - always succeeds
        // Simulate a small delay to make it feel realistic
        await new Promise(resolve => setTimeout(resolve, 500))
        setIsPurchasing(false)
        return { success: true }
      }

      // Native: Use RevenueCat for real purchases
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      const productId = PRODUCT_IDS[animalId]

      if (!productId) {
        setIsPurchasing(false)
        return { success: false, error: 'Product not found' }
      }

      // Get the product/offering
      const offerings = await Purchases.getOfferings()
      
      // Find the product in offerings
      let productToPurchase = null
      
      // Check current offering
      if (offerings.current?.availablePackages) {
        for (const pkg of offerings.current.availablePackages) {
          if (pkg.product.identifier === productId) {
            productToPurchase = pkg
            break
          }
        }
      }

      // If not found in current, check all offerings
      if (!productToPurchase && offerings.all) {
        for (const offeringKey of Object.keys(offerings.all)) {
          const offering = offerings.all[offeringKey]
          if (offering?.availablePackages) {
            for (const pkg of offering.availablePackages) {
              if (pkg.product.identifier === productId) {
                productToPurchase = pkg
                break
              }
            }
          }
          if (productToPurchase) break
        }
      }

      if (!productToPurchase) {
        // Try purchasing directly by product ID
        try {
          const result = await Purchases.purchaseStoreProduct({ 
            product: { identifier: productId } as any 
          })
          
          if (result.customerInfo) {
            setIsPurchasing(false)
            return { success: true }
          }
        } catch (directPurchaseError: any) {
          // Check if user cancelled
          if (directPurchaseError.code === 'PURCHASE_CANCELLED') {
            setIsPurchasing(false)
            return { success: false, error: 'Purchase cancelled' }
          }
          throw directPurchaseError
        }
      } else {
        // Purchase the package
        const result = await Purchases.purchasePackage({ aPackage: productToPurchase })
        
        if (result.customerInfo) {
          setIsPurchasing(false)
          return { success: true }
        }
      }

      setIsPurchasing(false)
      return { success: false, error: 'Purchase could not be completed' }
    } catch (error: any) {
      console.error('Purchase error:', error)
      setIsPurchasing(false)
      
      // Handle specific error codes
      if (error.code === 'PURCHASE_CANCELLED' || error.message?.includes('cancel')) {
        return { success: false, error: 'Purchase cancelled' }
      }
      
      return { 
        success: false, 
        error: error.message || 'Purchase failed. Please try again.' 
      }
    }
  }, [isNative])

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<number[]> => {
    if (!isNative) {
      // Web/Spark: No restore functionality
      return []
    }

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      const customerInfo = await Purchases.restorePurchases()
      
      // Map entitlements back to animal IDs
      const purchasedAnimalIds: number[] = []
      const activeEntitlements = customerInfo.customerInfo.entitlements.active
      
      for (const [animalId, productId] of Object.entries(PRODUCT_IDS)) {
        // Check if the product ID is in active entitlements
        for (const entitlement of Object.values(activeEntitlements)) {
          if (entitlement.productIdentifier === productId) {
            purchasedAnimalIds.push(parseInt(animalId))
            break
          }
        }
      }
      
      return purchasedAnimalIds
    } catch (error) {
      console.error('Restore purchases error:', error)
      return []
    }
  }, [isNative])

  return {
    isInitialized,
    isPurchasing,
    purchaseAnimal,
    restorePurchases,
  }
}
