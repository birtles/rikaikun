import { getEntryToCopy } from './copy-text';
import { NameTag } from './name-tags';

// Mock browser.i18n.getMessage
global.browser = {
  i18n: {
    getMessage: (id: string, replacements?: Array<string>) => {
      switch (id) {
        case 'content_kanji_base_radical':
          return `from ${replacements ? replacements[0] : '?'} (${
            replacements ? replacements[1] : '?'
          })`;
        case 'content_kanji_components_label':
          return 'components';
        case 'content_kanji_radical_label':
          return 'radical';
        default:
          return 'Unrecognized string ID';
      }
    },
  },
};

describe('getEntryToCopy', () => {
  it('prepares text from word search results', () => {
    expect(
      getEntryToCopy({
        type: 'word',
        data: {
          kanjiKana: '韓国語',
          kana: ['かんこくご'],
          romaji: ['kankokugo'],
          definition: '(n) Korean (language)',
          reason: null,
        },
      })
    ).toEqual('韓国語 [かんこくご] (kankokugo) (n) Korean (language)');
  });

  it('prepares text from name search results', () => {
    expect(
      getEntryToCopy({
        type: 'name',
        data: {
          names: [
            { kanji: 'いぶ喜', kana: 'いぶき' },
            { kanji: 'いぶ希', kana: 'いぶき' },
            { kanji: 'いぶ記', kana: 'いぶき' },
          ],
          definition: { tags: [NameTag.Female], text: 'Ibuki' },
        },
      })
    ).toEqual('いぶ喜 [いぶき], いぶ希 [いぶき], いぶ記 [いぶき] (f) Ibuki');
  });

  it('prepares text from kanji search results', () => {
    expect(
      getEntryToCopy({
        type: 'kanji',
        data: {
          c: '抜',
          r: {
            on: ['バツ', 'ハツ', 'ハイ'],
            kun: ['ぬ.く', 'ぬ.ける', 'ぬ.かす', 'ぬ.かる'],
            na: ['ぬき'],
          },
          m: ['slip out', 'extract'],
          rad: {
            x: 64,
            b: '⺘',
            k: '扌',
            na: ['てへん'],
            m: ['hand'],
            m_lang: 'en',
            base: {
              b: '⼿',
              k: '手',
              na: ['て'],
              m: ['hand'],
              m_lang: 'en',
            },
          },
          refs: {
            nelson_c: 1854,
            nelson_n: 2093,
            halpern_njecd: 246,
            halpern_kkld: 183,
            halpern_kkld_2ed: 219,
            heisig: 705,
            heisig6: 761,
            henshall: 1708,
            sh_kk: 1713,
            sh_kk2: 1830,
            kanji_in_context: 769,
            kodansha_compact: 864,
            skip: '1-3-4',
            sh_desc: '3c4.10',
            conning: 1951,
          },
          misc: {
            sc: 7,
            gr: 8,
            freq: 726,
            jlpt: 2,
            kk: 4,
          },
          comp: [
            {
              c: '⼇',
              na: ['なべぶた', 'けいさん', 'けいさんかんむり'],
              m: ['lid'],
              m_lang: 'en',
            },
            {
              c: '⼜',
              na: ['また'],
              m: ['or again', 'furthermore', 'on the other hand'],
              m_lang: 'en',
            },
            {
              c: '⼡',
              na: ['ふゆがしら', 'のまたかんむり', 'のまた', 'ちかんむり'],
              m: ['winter'],
              m_lang: 'en',
            },
            {
              c: '⺘',
              na: ['てへん'],
              m: ['hand'],
              m_lang: 'en',
            },
          ],
          m_lang: 'en',
        },
      })
    ).toEqual(
      '抜 [バツ、ハツ、ハイ、ぬ.く、ぬ.ける、ぬ.かす、ぬ.かる] (ぬき) slip out, extract; radical: ⺘（てへん） from ⼿ (て); components: ⼇ (なべぶた, lid), ⼜ (また, or again), ⼡ (ふゆがしら, winter), ⺘ (てへん, hand)'
    );
  });
});
