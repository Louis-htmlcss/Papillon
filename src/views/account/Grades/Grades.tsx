import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useTheme } from "@react-navigation/native";
import Reanimated from "react-native-reanimated";
import { useCurrentAccount } from "@/stores/account";
import * as pronote from "@/services/pronote"; // Assurez-vous que le chemin est correct
import GradesElement from "./Elements/GradeElement"; // Chemin corrigé
import { getSkills } from "@/services/pronote/Skills";

const Grades: React.FC = ({ navigation }) => {
  const { colors } = useTheme();
  const account = useCurrentAccount(state => state.account);
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSkills = async () => {
    try {
      const fetchedSkills = await getSkills(account, "Trimestre 1");
      setSkills(fetchedSkills);
    } catch (error) {
      console.error("Erreur lors de la récupération des compétences :", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchSkills();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      {isLoading ? (
        <Reanimated.View style={styles.loader}>
          <Text>Chargement...</Text>
        </Reanimated.View>
      ) : (
        skills.map(skill => <GradesElement key={skill.id} skill={skill} />)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Grades;