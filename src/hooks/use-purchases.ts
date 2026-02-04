import { useState, useEffect, useCallback } from 'react'
import { isNativePlatform, getPlatform } from './use-storage'

export const PRODUCT_IDS: Record<number, string> = {
  9: 'com.tilecalculator.animal_griffin',
  10: 'com.tilecalculator.animal_cthulhu',
  13: 'com.tilecalculator.animal_sasquatch',
  14: 'com.tilecalculator.animal_lizardking',
  15: 'com.tilecalculator.animal_zombie',
  16: 'com.tilecalculator.animal_trex',
  18: 'com.tilecalculator.animal_anglerfish',
  19: 'com.tilecalculator.animal_shark',
  20: 'com.tilecalculator.animal_whale',
  21: 'com.tilecalculator.animal_mousepat',
}

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
  restorePurchases: () => Promise<number[]>
}

export function usePurchases(): UsePurchasesReturn {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isNative, setIsNative] = useState(false)
  const [platform, setPlatform] = useState('web')

  useEffect(() => {
    const initializePurchases = async () => {
      const native = isNativePlatform()
      const plat = getPlatform()
      setIsNative(native)
      setPlatform(plat)

      if (!native) {
        setIsInitialized(true)
        return
      }

      try {
        const { Purchases } = await import('@revenuecat/purchases-capacitor')
        
        const apiKey = plat === 'android' 
          ? REVENUECAT_API_KEYS.android 
          : REVENUECAT_API_KEYS.ios

        try {
          await Purchases.configure({ apiKey })
          console.log('RevenueCat initialized successfully')
        } catch (configError) {
          console.log('RevenueCat may already be configured:', configError)
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error)
        setIsInitialized(true)
      }
    }

    initializePurchases()
  }, [])

  const purchaseAnimal = useCallback(async (
    animalId: number, 
    _animalName: string, 
    _price: number
  ): Promise<PurchaseResult> => {
    setIsPurchasing(true)

    try {
      if (!isNative) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setIsPurchasing(false)
        return { success: true }
      }

      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      const productId = PRODUCT_IDS[animalId]

      if (!productId) {
        setIsPurchasing(false)
        return { success: false, error: 'Product not found' }
      }

      const offerings = await Purchases.getOfferings()
      
      let productToPurchase: any = null
      
      if (offerings.current?.availablePackages) {
        for (const pkg of offerings.current.availablePackages) {
          if (pkg.product.identifier === productId) {
            productToPurchase = pkg
            break
          }
        }
      }

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
        try {
          const result = await Purchases.purchaseStoreProduct({ 
            product: { identifier: productId } as any 
          })
          
          if (result.customerInfo) {
            setIsPurchasing(false)
            return { success: true }
          }
        } catch (directPurchaseError: any) {
          if (directPurchaseError.code === 'PURCHASE_CANCELLED') {
            setIsPurchasing(false)
            return { success: false, error: 'Purchase cancelled' }
          }
          throw directPurchaseError
        }
      } else {
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
      
      if (error.code === 'PURCHASE_CANCELLED' || error.message?.includes('cancel')) {
        return { success: false, error: 'Purchase cancelled' }
      }
      
      return { 
        success: false, 
        error: error.message || 'Purchase failed. Please try again.' 
      }
    }
  }, [isNative])

  const restorePurchases = useCallback(async (): Promise<number[]> => {
    if (!isNative) {
      return []
    }

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      const customerInfo = await Purchases.restorePurchases()
      
      const purchasedAnimalIds: number[] = []
      const activeEntitlements = customerInfo.customerInfo.entitlements.active
      
      for (const [animalId, productId] of Object.entries(PRODUCT_IDS)) {
        for (const entitlement of Object.values(activeEntitlements)) {
          if ((entitlement as any).productIdentifier === productId) {
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
