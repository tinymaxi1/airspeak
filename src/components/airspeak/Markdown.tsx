/**
 * SimpleMarkdown — Theory dersleri ve unit intro modal'ı için minimal renderer.
 * Destek: # H1, ## H2, ### H3, **bold**, *italic*, - bullet, paragraf.
 * Yeni bağımlılık eklenmedi; basit regex tabanlı.
 */
import { Fragment } from 'react';
import { View, Text } from 'react-native';
import { FONTS } from './typography';

type Props = {
  source: string;
  textColor?: string;
};

export function SimpleMarkdown({ source, textColor = '#0E1116' }: Props) {
  const blocks = source.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <View style={{ gap: 12 }}>
      {blocks.map((block, i) => renderBlock(block, i, textColor))}
    </View>
  );
}

function renderBlock(block: string, key: number, color: string) {
  // Headers
  if (block.startsWith('### ')) {
    return (
      <Text key={key} style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: '700', color, lineHeight: 22 }}>
        {renderInline(block.slice(4))}
      </Text>
    );
  }
  if (block.startsWith('## ')) {
    return (
      <Text key={key} style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: '700', color, lineHeight: 26, marginTop: 4 }}>
        {renderInline(block.slice(3))}
      </Text>
    );
  }
  if (block.startsWith('# ')) {
    return (
      <Text key={key} style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: '700', color, lineHeight: 30, marginTop: 4 }}>
        {renderInline(block.slice(2))}
      </Text>
    );
  }
  // Bullet list
  if (block.split('\n').every((l) => l.trim().startsWith('- '))) {
    return (
      <View key={key} style={{ gap: 6 }}>
        {block.split('\n').map((line, j) => (
          <View key={j} style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={{ color, fontSize: 15, lineHeight: 22 }}>•</Text>
            <Text style={{ color, fontSize: 15, lineHeight: 22, flex: 1, fontFamily: FONTS.body }}>
              {renderInline(line.replace(/^-\s+/, ''))}
            </Text>
          </View>
        ))}
      </View>
    );
  }
  // Paragraph
  return (
    <Text key={key} style={{ color, fontSize: 15, lineHeight: 23, fontFamily: FONTS.body }}>
      {renderInline(block)}
    </Text>
  );
}

// **bold** ve *italic* için basit tokenizer
function renderInline(text: string) {
  const parts: Array<{ kind: 'b' | 'i' | 't'; v: string }> = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ kind: 't', v: text.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith('**')) parts.push({ kind: 'b', v: tok.slice(2, -2) });
    else parts.push({ kind: 'i', v: tok.slice(1, -1) });
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push({ kind: 't', v: text.slice(last) });
  return (
    <Fragment>
      {parts.map((p, i) =>
        p.kind === 'b' ? (
          <Text key={i} style={{ fontWeight: '700' }}>{p.v}</Text>
        ) : p.kind === 'i' ? (
          <Text key={i} style={{ fontStyle: 'italic' }}>{p.v}</Text>
        ) : (
          <Fragment key={i}>{p.v}</Fragment>
        ),
      )}
    </Fragment>
  );
}
