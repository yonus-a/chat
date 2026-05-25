import data from "@emoji-mart/data";

interface EmojiData {
  emojis: Record<
    string,
    {
      skins: { native: string }[];
    }
  >;
}

interface EmojiSegment {
  type: "emoji" | "text";
  value: string;
  hexFileName?: string;
}

// Build a lookup Map: native emoji → hex filename
const emojiMap = new Map<string, string>();
const emojiData = data as EmojiData;

for (const key of Object.keys(emojiData.emojis)) {
  const emoji = emojiData.emojis[key];
  if (emoji.skins) {
    for (const skin of emoji.skins) {
      const native = skin.native;
      const hex = [...native]
        .map((char) => {
          const codePoint = char.codePointAt(0);
          return codePoint ? codePoint.toString(16) : "";
        })
        .filter(Boolean)
        .join("-");
      emojiMap.set(native, hex);
    }
  }
}

/**
 * Parse text into segments of text and emoji for proper rendering.
 */
export function parseEmojiArray(text: string): EmojiSegment[] {
  if (!text) return [];

  const result: EmojiSegment[] = [];
  let currentText = "";

  for (const segment of segmentGraphemes(text)) {
    const hexFileName = emojiMap.get(segment);
    if (hexFileName) {
      if (currentText) {
        result.push({ type: "text", value: currentText });
        currentText = "";
      }
      result.push({ type: "emoji", value: segment, hexFileName });
    } else {
      currentText += segment;
    }
  }

  if (currentText) {
    result.push({ type: "text", value: currentText });
  }

  return result;
}

function segmentGraphemes(text: string): string[] {
  type IntlWithSegmenter = typeof Intl & {
    Segmenter?: new (
      locales?: string | string[],
      options?: { granularity?: "grapheme" },
    ) => {
      segment: (input: string) => Iterable<{ segment: string }>;
    };
  };

  const IntlWithGraphemeSegmenter = Intl as IntlWithSegmenter;
  if (IntlWithGraphemeSegmenter.Segmenter) {
    const segmenter = new IntlWithGraphemeSegmenter.Segmenter(undefined, {
      granularity: "grapheme",
    });
    return [...segmenter.segment(text)].map(({ segment }) => segment);
  }

  return [...text];
}

export type { EmojiSegment };
