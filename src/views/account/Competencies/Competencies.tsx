// src/views/account/Competencies/Competencies.tsx
import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { NativeText, NativeList, NativeItem, NativeListHeader } from "@/components/Global/NativeComponents";
import { Screen } from "@/router/helpers/types";
import { useCurrentAccount } from "@/stores/account";
import { BarChart2 } from "lucide-react-native";
import { getCompetencies, Competency } from "@/services/pronote/grades";
import { getGradesPeriods } from "@/services/pronote/grades";
import { Picker } from "@react-native-picker/picker";

const Competencies: Screen<"Competencies"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;
  const account = useCurrentAccount(store => store.account);

  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  const fetchPeriods = useCallback(async () => {
    if (account) {
      try {
        const { periods, default: defaultPeriod } = await getGradesPeriods(account);
        setPeriods(periods);
        setSelectedPeriod(defaultPeriod);
      } catch (error) {
        console.error("Erreur lors de la récupération des périodes :", error);
      }
    }
  }, [account]);

  const fetchCompetencies = useCallback(async () => {
    if (account && selectedPeriod) {
      try {
        const data = await getCompetencies(account, selectedPeriod);
        setCompetencies(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des compétences :", error);
      }
    }
  }, [account, selectedPeriod]);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  useEffect(() => {
    fetchCompetencies();
  }, [fetchCompetencies]);

  return (
    <ScrollView style={styles.container}>
      <NativeListHeader label="Compétences" />

      <Picker
        selectedValue={selectedPeriod}
        onValueChange={(itemValue) => setSelectedPeriod(itemValue)}
        style={{ marginVertical: 10 }}
      >
        {periods.map((period, index) => (
          <Picker.Item label={period} value={period} key={index} />
        ))}
      </Picker>

      <NativeList>
        {competencies.map((competency, index) => (
          <NativeItem
            key={index}
            icon={<BarChart2 color={colors.text} />}
          >
            <NativeText variant="title">{competency.skillName}</NativeText>
            <NativeText variant="subtitle">{`${competency.subjectName} - ${competency.skillLevel}`}</NativeText>
            <NativeText variant="subtitle">{competency.evaluationDate.toLocaleDateString()}</NativeText>
          </NativeItem>
        ))}
      </NativeList>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Utilisez `colors.card` si accessible
    padding: 16,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#000",
  },
});

export default Competencies;