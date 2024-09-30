import React, { useEffect, useState } from "react";
import { ScrollView, TextInput, View, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Screen } from "@/router/helpers/types";
import { NativeText } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { Recipient } from "@/services/shared/Recipient";
import { createDiscussion, createDiscussionRecipients } from "@/services/chats";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { PressableScale } from "react-native-pressable-scale";
import { BlurView } from "expo-blur";
import { Send, User } from "lucide-react-native";
import Reanimated, { FadeIn } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";

const ChatCreate: Screen<"ChatCreate"> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(state => state.account!);

  const [recipients, setRecipients] = useState<Recipient[] | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    void async function () {
      const recipients = await createDiscussionRecipients(account);
      setRecipients(recipients);
    }();
  }, [account?.instance]);

  const handleCreateDiscussion = async () => {
    await createDiscussion(account, subject, content, selectedRecipients);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <PapillonModernHeader>
        <NativeText style={styles.headerTitle}>Nouvelle discussion</NativeText>
      </PapillonModernHeader>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 56 }
        ]}
      >
        <TextInput
          value={subject}
          onChangeText={setSubject}
          placeholder="Sujet de la discussion"
          style={[styles.input, { color: theme.colors.text }]}
          placeholderTextColor={theme.colors.text + "80"}
        />
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Contenu du premier message"
          style={[styles.input, styles.contentInput, { color: theme.colors.text }]}
          placeholderTextColor={theme.colors.text + "80"}
          multiline
        />
        <NativeText style={styles.recipientsTitle}>Destinataires :</NativeText>
        <View style={styles.recipientsList}>
          {recipients?.map((recipient, index) => (
            <Reanimated.View
              key={index}
              entering={animPapillon(FadeIn).delay(index * 50)}
            >
              <PressableScale
                style={[
                  styles.recipientItem,
                  {
                    backgroundColor: selectedRecipients.includes(recipient)
                      ? theme.colors.primary
                      : theme.colors.card,
                  }
                ]}
                onPress={() => {
                  setSelectedRecipients(prev =>
                    prev.includes(recipient)
                      ? prev.filter(r => r !== recipient)
                      : [...prev, recipient]
                  );
                }}
              >
                <User size={16} color={selectedRecipients.includes(recipient) ? "#fff" : theme.colors.text} />
                <NativeText style={[
                  styles.recipientName,
                  { color: selectedRecipients.includes(recipient) ? "#fff" : theme.colors.text }
                ]}>
                  {recipient.name}
                </NativeText>
              </PressableScale>
            </Reanimated.View>
          )) || (
            <NativeText style={styles.loadingText}>
              Chargement des destinataires...
            </NativeText>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "semibold",
  },
  scrollContent: {
    padding: 16,
  },
  input: {
    fontFamily: "regular",
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: 16,
  },
  contentInput: {
    height: 100,
    textAlignVertical: "top",
  },
  recipientsTitle: {
    fontSize: 16,
    fontFamily: "semibold",
    marginBottom: 8,
  },
  recipientsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  recipientItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  recipientName: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: "medium",
  },
  loadingText: {
    fontStyle: "italic",
  },
});

export default ChatCreate;
