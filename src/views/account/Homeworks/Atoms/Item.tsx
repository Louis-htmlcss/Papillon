import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import parse_homeworks from "@/utils/format/format_pronote_homeworks";
import { getSubjectData } from "@/services/shared/Subject";
import { useTheme } from "@react-navigation/native";
import type { Homework } from "@/services/shared/Homework";
import { NativeItem, NativeText } from "@/components/Global/NativeComponents";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { StyleSheet } from "react-native";

const HomeworkItem = ({ homework, onDonePressHandler, index, total, searchTerms }) => {
  const theme = useTheme();
  const [subjectData, setSubjectData] = useState(getSubjectData(homework.subject));

  useEffect(() => {
    const data = getSubjectData(homework.subject);
    setSubjectData(data);
  }, [homework.subject]);

  const [isLoading, setIsLoading] = useState(false);

  const handlePress = useCallback(() => {
    setIsLoading(true);
    onDonePressHandler();
  }, [onDonePressHandler]);

  const [mainLoaded, setMainLoaded] = useState(false);

  useEffect(() => {
    setIsLoading(false);
    setMainLoaded(true);
  }, [homework.done]);

  const parsedContent = useMemo(() => parse_homeworks(homework.content), [homework.content]);

  const [expanded, setExpanded] = useState(false);

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withTiming(expanded ? "180deg" : "0deg") }],
    };
  });

  const [needsExpansion, setNeedsExpansion] = useState(parsedContent.length > 100);

  const highlightSearchTerms = (text) => {
    if (!searchTerms) return text;

    const parts = text.split(new RegExp(`(${searchTerms})`, "gi"));
    return (
      <Text>
        {parts.map((part, i) =>
          part.toLowerCase() === searchTerms.toLowerCase() ? (
            <Text key={i} style={styles.highlightedText}>{part}</Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  return (
    <NativeItem
      animated
      key={homework.content}
      entering={FadeIn}
      exiting={FadeOut}
      separator={index !== total - 1}
      leading={
        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <PapillonCheckbox
            checked={homework.done}
            loading={isLoading}
            onPress={handlePress}
            style={{ marginRight: 1 }}
            color={subjectData.color}
            loaded={mainLoaded}
          />
        </Reanimated.View>
      }
    >
      <Reanimated.View
        layout={animPapillon(LinearTransition)}
        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <Reanimated.View style={{ flex: 1, gap: 4 }} layout={animPapillon(LinearTransition)}>
          <NativeText variant="overtitle" style={{ color: subjectData.color }} numberOfLines={1}>
            {subjectData.pretty}
          </NativeText>
          <Reanimated.View layout={animPapillon(LinearTransition)}>
            <NativeText
              variant="default"
              numberOfLines={expanded ? undefined : 3}
            >
              {highlightSearchTerms(parsedContent)}
            </NativeText>
          </Reanimated.View>
        </Reanimated.View>
        {needsExpansion && (
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Animated.View style={[{ marginLeft: 8 }, rotateStyle]}>
              {expanded ? (
                <ChevronUp size={22} strokeWidth={2.5} opacity={0.6} color={theme.colors.text} />
              ) : (
                <ChevronDown size={22} strokeWidth={2.5} opacity={0.6} color={theme.colors.text} />
              )}
            </Animated.View>
          </TouchableOpacity>
        )}
      </Reanimated.View>
    </NativeItem>
  );
};

const styles = StyleSheet.create({
  highlightedText: {
    backgroundColor: "transparent",
    color: theme.colors.primary,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default HomeworkItem;