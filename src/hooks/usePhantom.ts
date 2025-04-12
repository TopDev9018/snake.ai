// hooks/usePhantom.ts
import { useEffect, useState } from "react";

export const usePhantom = () => {
  const [walletAvailable, setWalletAvailable] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    if ("solana" in window && (window as any).solana?.isPhantom) {
      setWalletAvailable(true);
    }
  }, []);

  const connect = async () => {
    try {
      const solana = (window as any).solana;
      if (!solana) throw new Error("Phantom not found");

      const res = await solana.connect();
      setPublicKey(res.publicKey.toString());
      return res.publicKey.toString();
    } catch (error) {
      console.error("Phantom connection error:", error);
      return null;
    }
  };

  return {
    walletAvailable,
    publicKey,
    connect,
  };
};
