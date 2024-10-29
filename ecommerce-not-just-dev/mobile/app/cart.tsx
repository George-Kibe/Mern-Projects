import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { View, FlatList, Alert } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Redirect, useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createOrder } from '@/api/orders';
import React from 'react'
import { useCart } from '@/store/cartStore';
import { create } from 'zustand';

const CartScreen = () => {
  const items = useCart((state) => state.items);
  console.log("cart Items: ", items);
  const resetCart = useCart((state) => state.resetCart);

  const createOrderMutation = useMutation({
    mutationFn: () =>
      createOrder(
        items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price, // MANAGE FORM SERVER SIDE
        }))
      ),
    onSuccess: (data) => {
      // paymentIntentMutation.mutate({ orderId: data.id });
      Alert.alert('Checkout', 'Order placed successfully!')
      resetCart();
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const onCheckout = async() => {
    createOrderMutation.mutateAsync();
  };

  if (items.length === 0) {
    return <Redirect href={'/'} />;
  }
  return (
    <FlatList
      data={items}
      contentContainerClassName="gap-2 max-w-[960px] w-full mx-auto p-2"
      renderItem={({ item }) => (
        <HStack className="bg-white p-3">
          <VStack space="sm">
            <Text bold>{item.product.name}</Text>
            <Text>$ {item.product.price}</Text>
          </VStack>
          <Text className="ml-auto">{item.quantity}</Text>
        </HStack>
      )}
      ListFooterComponent={() => (
        <Button onPress={onCheckout}>
          <ButtonText>Checkout</ButtonText>
        </Button>
      )}
  />
  )
}

export default CartScreen
