import { Text, View } from "react-native";
import { s } from "./styles";
import { Info } from "../info";
import { IconMapPin, IconPhone, IconTicket } from "@tabler/icons-react-native";

export type PropsDetails = {
  name: string;
  description: string;
  address: string;
  phone: string;
  cupons: number;
  rules: {
    id: string;
    description: string;
  }[];
};

type Props = {
  data: PropsDetails;
};
export function Details({
  data: { name, description, cupons, phone, rules, address },
}: Props) {
  return (
    <View style={s.container}>
      <Text style={s.name}>{name}</Text>
      <Text style={s.description}>{description}</Text>

      <View style={s.group}>
        <Text style={s.title}>Informações</Text>

        <Info icon={IconTicket} description={`${cupons} cupons disponíveis`} />
        <Info icon={IconMapPin} description={address} />
        <Info icon={IconPhone} description={phone} />
      </View>

      <View style={s.group}>
        <Text style={s.title}>Regulamento</Text>
        {rules.map((rule) => (
          <Text key={rule.id} style={s.rule}>
            {`\u2022 ${rule.description}`}
          </Text>
        ))}
      </View>
    </View>
  );
}
