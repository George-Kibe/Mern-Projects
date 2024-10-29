import { FormControl } from '@/components/ui/form-control';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { useState } from 'react';
import { HStack } from '@/components/ui/hstack';
import { useMutation } from '@tanstack/react-query';
import { login, signup } from '@/api/auth';
import { useAuth } from '@/store/authStore';
import { Redirect, router } from 'expo-router';
import React from 'react';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const setUser = useAuth((s) => s.setUser);
  const setToken = useAuth((s) => s.setToken);
  const isLoggedIn = useAuth((s) => !!s.token);

  const loginMutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      console.log('Success sign up: ', data.accessToken);
      console.log('Success sign up: ', data.user);
      if (data.user && data.accessToken) {
        setUser(data.user);
        setToken(data.accessToken);
        router.push('/')
      }
    },
    onError: () => {
      console.log('Error');
    },
  });

  const signupMutation = useMutation({
    mutationFn: () => signup(email, password),
    onSuccess: (data) => {
      if (data.user && data.accessToken) {
        console.log('User and accesstoken set ');
        setUser(data.user);
        setToken(data.accessToken);
      }
    },
    onError: (error) => {
      console.log('Error: ', error);
    },
  });

  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };

  if (isLoggedIn) {
    return <Redirect href={'/'} />;
  }

  return (
    <FormControl
      isInvalid={loginMutation.error || signupMutation.error}
      className="p-4 border rounded-lg max-w-[500px] border-outline-300 bg-white m-2"
    >
      <VStack space="xl">
        <Heading className="text-typography-900 leading-3 pt-3">Login</Heading>
        <VStack space="xs">
          <Text className="text-typography-500 leading-1">Email</Text>
          <Input>
            <InputField value={email} onChangeText={setEmail} type="text" />
          </Input>
        </VStack>
        <VStack space="xs">
          <Text className="text-typography-500 leading-1">Password</Text>
          <Input className="text-center">
            <InputField
              value={password}
              onChangeText={setPassword}
              type={showPassword ? 'text' : 'password'}
            />
            <InputSlot className="pr-3" onPress={handleState}>
              {/* EyeIcon, EyeOffIcon are both imported from 'lucide-react-native' */}
              <InputIcon
                as={showPassword ? EyeIcon : EyeOffIcon}
                className="text-darkBlue-500"
              />
            </InputSlot>
          </Input>
        </VStack>
        <HStack space="sm">
          <Button
            className="flex-1"
            variant="outline"
            onPress={() => signupMutation.mutate()}
          >
            <ButtonText>
                {signupMutation.isPending ? 'Signing up...' : 'Sign up'}
            </ButtonText>
          </Button>
          <Button className="flex-1" onPress={() => loginMutation.mutate()}>
            <ButtonText>
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </ButtonText>
          </Button>
        </HStack>
      </VStack>
    </FormControl>
  );
}