// utils/emojiParser.ts

export function parseEmojiArray(text: string | undefined) {
  if (!text) return [];

  // Note the parentheses ( ) around the regex. 
  // In JS, splitting by a regex WITH a capturing group includes the matches in the resulting array!
  const emojiRegex = /([\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{200D}\u{FE0F}]+)/gu;
  
  // Example: "Hi 😀" becomes ["Hi ", "😀", ""]
  const chunks = text.split(emojiRegex);

  return chunks.map((chunk, index) => {
    // Because of how split works with capturing groups, 
    // emojis will ALWAYS be at odd indices (1, 3, 5...). Text is at even indices.
    if (index % 2 !== 0) {
      const hexFilename = Array.from(chunk)
        .map(char => char.codePointAt(0)?.toString(16))
        .filter(hex => hex !== 'fe0f')
        .join('-');

      return { type: 'emoji', content: chunk, hex: hexFilename };
    }
    
    return { type: 'text', content: chunk };
  }).filter(chunk => chunk.content !== ''); // Strip out empty strings for cleaner DOM
}