import { useEffect, useRef, useState } from "react";
import { Alert, Modal, ScrollView, StatusBar, View } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";

import { api } from "@/services/api";

import { Loading } from "@/components/loading";
import { Cover } from "@/components/market/cover";
import { Details, PropsDetails } from "@/components/market/details";
import { Coupum } from "@/components/market/coupom";
import { Button } from "@/components/button";
import { CameraView, useCameraPermissions } from "expo-camera";

type DataProps = PropsDetails & {
  cover: string;
};

export function Market() {
  const [data, setData] = useState<DataProps>();
  const [coupon, setCoupon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [couponIsFetching, setIsCouponIsFetching] = useState(false);
  const [isVisibleCameraModa, setIsVisibleCameraModal] = useState(false);

  const [_, requestPermission] = useCameraPermissions();
  const { id } = useLocalSearchParams<{ id: string }>();

  const qrLock = useRef(false);

  async function fetchMarket() {
    try {
      const { data } = await api.get("/markets/" + id);
      setData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();

      if (!granted) {
        return Alert.alert("Câmera", "Você precisa habilitar o uso da câmera");
      }

      qrLock.current = false;
      setIsVisibleCameraModal(true);
    } catch (error) {}
  }

  async function getCoupon(id: string) {
    try {
      setIsCouponIsFetching(true);
      const { data } = await api.patch(`/coupons/${id}`);
      Alert.alert("Cupom", data.coupon);
      setCoupon(data.coupon);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível utilizar o cupom");
    } finally {
      setIsCouponIsFetching(false);
    }
  }

  function handleUseCoupon(id: string) {
    setIsVisibleCameraModal(false);
    Alert.alert(
      "Cupom",
      "Não é possivel reutilizar um cupom resgatado. Deseja realmente resgatar o cupom?",
      [
        {
          style: "cancel",
          text: "Não",
        },
        {
          text: "Sim",
          onPress: () => getCoupon(id),
        },
      ]
    );
  }

  useEffect(() => {
    fetchMarket();
  }, [id, coupon]);

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" hidden={isVisibleCameraModa} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Cover uri={data.cover} />
        <Details data={data} />
        {coupon && <Coupum code={coupon} />}
      </ScrollView>

      <View style={{ padding: 32 }}>
        <Button onPress={handleOpenCamera}>
          <Button.Title>Ler QR Code</Button.Title>
        </Button>
      </View>

      <Modal style={{ flex: 1 }} visible={isVisibleCameraModa}>
        <CameraView
          facing="back"
          onBarcodeScanned={({ data }) => {
            if (data && !qrLock.current) {
              qrLock.current = true;
              setTimeout(() => handleUseCoupon(data), 500);
            }
          }}
          style={{ flex: 1 }}
        />
        <View style={{ position: "absolute", bottom: 32, left: 32, right: 32 }}>
          <Button
            onPress={() => setIsVisibleCameraModal(false)}
            isLoading={couponIsFetching}
          >
            <Button.Title>Voltar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
