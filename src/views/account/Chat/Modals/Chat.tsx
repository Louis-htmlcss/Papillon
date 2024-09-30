import React, { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Reanimated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { PressableScale } from "react-native-pressable-scale";
import { ArrowLeft, Send } from "lucide-react-native";

import type { Screen } from "@/router/helpers/types";
import { NativeText } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import type { ChatMessage } from "@/services/shared/Chat";
import { getChatMessages } from "@/services/chats";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { animPapillon } from "@/utils/ui/animations";

const Chat: Screen<"Chat"> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");

  const account = useCurrentAccount(state => state.account!);
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadMessages();
  }, [route.params.handle]);

  const loadMessages = async () => {
    const fetchedMessages = await getChatMessages(account, route.params.handle);
    setMessages(fetchedMessages);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;


    const newChatMessage: ChatMessage = {
      id: Date.now().toString(),
      author: account.name,
      content: newMessage,
      date: new Date(),
    };
    setMessages(prevMessages => prevMessages ? [...prevMessages, newChatMessage] : [newChatMessage]);
    setNewMessage("");

  };

  return (
    <View style={styles.container}>
      <PapillonModernHeader>
        <PressableScale onPress={() => navigation.goBack()}>
          <BlurView style={styles.backButton} tint={theme.dark ? "dark" : "light"}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </BlurView>
        </PressableScale>
        <NativeText style={styles.headerTitle}>{route.params.handle.subject}</NativeText>
      </PapillonModernHeader>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollViewContent,
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 60 }
        ]}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages?.map((message) => (
          <Reanimated.View
            key={message.id}
            entering={animPapillon(FadeIn)}
            layout={animPapillon(LinearTransition)}
            style={[
              styles.messageContainer,
              { backgroundColor: message.author === account.name ? theme.colors.primary + "20" : theme.colors.card }
            ]}
          >
            <NativeText style={styles.messageAuthor}>{message.author}</NativeText>
            <NativeText style={styles.messageContent}>{message.content}</NativeText>
            <NativeText style={styles.messageDate}>{new Date(message.date).toLocaleString("fr-FR")}</NativeText>
          </Reanimated.View>
        )) || (
          <NativeText style={styles.loadingText}>
            Chargement des messages...
          </NativeText>
        )}
      </ScrollView>

      <BlurView style={[styles.inputContainer, { bottom: insets.bottom }]} tint={theme.dark ? "dark" : "light"}>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Écrivez un message..."
          placeholderTextColor={theme.colors.text + "80"}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Send size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollViewContent: {
    padding: 16,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageAuthor: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  messageContent: {
    marginBottom: 4,
  },
  messageDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: "absolute",
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});

export default Chat;
