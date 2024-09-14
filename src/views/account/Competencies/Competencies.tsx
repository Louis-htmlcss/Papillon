import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { NativeText, NativeList, NativeItem, NativeListHeader } from "@/components/Global/NativeComponents";
import { Screen } from "@/router/helpers/types";
import { useCurrentAccount } from "@/stores/account";
import { BarChart2 } from "lucide-react-native";
import * as pronote from "@/lib/pronote";
import { useSession } from "@/stores/session";

const Competencies: Screen<"Competencies"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;
  const account = useCurrentAccount(store => store.account);
  const session = useSession(store => store.session);

  const [competencies, setCompetencies] = useState([]);

  useEffect(() => {
    const fetchCompetencies = async () => {
      if (!session) return;

      try {
        const tab = session.userResource.tabs.get(pronote.TabLocation.Evaluations);
        if (!tab) throw new Error("Cannot retrieve periods for the evaluations tab");

        const selectedPeriod = tab.periods[0]; // Assuming we want the first period

        const evaluations = await pronote.evaluations(session, selectedPeriod);

        const allSkills = evaluations.flatMap(evaluation => evaluation.skills);
        const uniqueSkills = Array.from(new Set(allSkills.map(skill => skill.domainName)))
          .map(domainName => {
            const skill = allSkills.find(s => s.domainName === domainName);
            return {
              id: domainName,
              name: domainName,
              level: skill ? skill.level : "Non évalué",
            };
          });

        setCompetencies(uniqueSkills);
      } catch (error) {
        console.error("Error fetching competencies:", error);
      }
    };

    fetchCompetencies();
  }, [session]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Compétences",
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <NativeListHeader label="Compétences" />
      <NativeList>
        {competencies.map((competency) => (
          <NativeItem
            key={competency.id}
            icon={<BarChart2 color={colors.text} />}
          >
            <NativeText variant="title">{competency.name}</NativeText>
            <NativeText variant="subtitle">{competency.level}</NativeText>
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