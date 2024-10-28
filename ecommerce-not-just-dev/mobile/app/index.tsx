import { ActivityIndicator, FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import React from 'react'
import products from '@/assets/products.json'
import ProductListItem from '@/components/ProductListItem'
import { useBreakpointValue } from '@/components/ui/utils/use-break-point-value'
import { listProducts } from '@/api/products'
import { useQuery } from '@tanstack/react-query'

const HomeScreen = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: listProducts,
  });
  const numColumns = useBreakpointValue({
    default: 2,
    sm: 3,
    xl: 4,
  });
  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Error fetching products</Text>;
  }

  return ( 
    <FlatList 
      key={numColumns}
      numColumns={numColumns}
      data={data}
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