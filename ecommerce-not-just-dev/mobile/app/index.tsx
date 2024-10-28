import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import React from 'react'
import products from '@/assets/products.json'
import ProductListItem from '@/components/ProductListItem'
import { useBreakpointValue } from '@/components/ui/utils/use-break-point-value'

const HomeScreen = () => {
  const {width} = useWindowDimensions();
  const numColumns = useBreakpointValue({
    default: 2,
    sm: 3,
    xl: 4,
  });

  return ( 
    <FlatList 
      key={numColumns}
      numColumns={numColumns}
      data={products}
      contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full"
      columnWrapperClassName="gap-2"
      renderItem={({item}) => (
        <ProductListItem product={item} />
      )}
    />
  )
}

export default HomeScreen

const styles = StyleSheet.create({});