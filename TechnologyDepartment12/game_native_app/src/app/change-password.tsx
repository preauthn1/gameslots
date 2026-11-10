import { Redirect, useLocalSearchParams } from 'expo-router';

export default function ChangePasswordRedirect() {
  const { tab } = useLocalSearchParams();
  if (tab === 'transaction') return <Redirect href="/change-transaction-password" />;
  return <Redirect href="/change-login-password" />;
}
