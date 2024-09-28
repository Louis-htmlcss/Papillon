type SupportedTags = {
  [key: string]: string | ((text: string) => string);
};

function parse_homeworks (content: string): string {
  const supportedTags: SupportedTags = {
    br: "\n",
    strong: (text: string) => `**${text}**`,
  };

  const ignoredTags: Set<string> = new Set(["div", "span", "style", "script", "footer", "header"]);

  const tagRegex = /<\/?([a-zA-Z]+)(?:\s[^>]*)?>|([^<]+)/g;

  const htmlEntities: { [key: string]: string } = {
    "&nbsp;": " ",
    "&quot;": "\"",
    "&#039;": "'"
  };

  function decodeHtmlEntities (text: string): string {
    return text.replace(/&#(\d+);/g, (match: string, dec: string) => String.fromCharCode(parseInt(dec, 10)))
      .replace(/&([a-zA-Z]+);/g, (match: string) => htmlEntities[match] || match);
  }

  let result = "";
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(content)) !== null) {
    const [fullMatch, tagName, text] = match;

    if (text) {
      // Remplace les entités HTML dans le texte
      result += decodeHtmlEntities(text);
    } else if (tagName) {
      const isClosingTag: boolean = fullMatch.startsWith("</");
      const tag: string = tagName.toLowerCase();

      if (!isClosingTag) {
        if (ignoredTags.has(tag)) {
          continue; // Ignore les balises non supportées
        } else if (supportedTags[tag]) {
          // Balise ouvrante supportée
          if (typeof supportedTags[tag] === "string") {
            result += supportedTags[tag] as string;
          } else {
            const children: string[] = [];
            let innerMatch: RegExpExecArray | null;
            while ((innerMatch = tagRegex.exec(content)) !== null) {
              const [innerFullMatch, innerTagName, innerText] = innerMatch;
              if (innerText) {
                children.push(innerText);
              } else if (innerTagName && innerFullMatch.startsWith("</") && innerTagName.toLowerCase() === tag) {
                break;
              }
            }
            result += (supportedTags[tag] as (text: string) => string)(decodeHtmlEntities(children.join("")));
          }
        }
      }
    }
  }

  // if there are multiple spaces, replace them with a single space
  result = result.replace(/\s{2,}/g , " ");

  return result;
}

export default parse_homeworks;
