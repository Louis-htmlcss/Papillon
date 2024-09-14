import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { NativeText, NativeList, NativeItem, NativeListHeader } from "@/components/Global/NativeComponents";
import { Screen } from "@/router/helpers/types";
import { useCurrentAccount } from "@/stores/account";
import { BarChart2 } from "lucide-react-native";
import { getCompetencies } from "@/services/pronote/grades";
import { getGradesPeriods } from "@/services/grades";

const Competencies: Screen<"Competencies"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;
  const account = useCurrentAccount(store => store.account);

  const [competencies, setCompetencies] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const fetchPeriods = useCallback(async () => {
    if (account) {
      try {
        const { periods, default: defaultPeriod } = await getGradesPeriods(account);
        setPeriods(periods);
        setSelectedPeriod(defaultPeriod);
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    }
  }, [account]);

  const fetchCompetencies = useCallback(async () => {
    if (account && selectedPeriod) {
      try {
        const data = await getCompetencies(account, selectedPeriod);
        setCompetencies(data);
      } catch (error) {
        console.error("Error fetching competencies:", error);
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
      <NativeList>
        {competencies.map((competency, index) => (
          <NativeItem
            key={index}
            icon={<BarChart2 color={colors.text} />}
          >
            <NativeText variant="title">{competency.skillName}</NativeText>
            <NativeText variant="subtitle">{`${competency.subjectName} - ${competency.skillLevel}`}</NativeText>
            <NativeText variant="subtitle">{new Date(competency.evaluationDate).toLocaleDateString()}</NativeText>
          </NativeItem>
        ))}
      </NativeList>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Competencies;