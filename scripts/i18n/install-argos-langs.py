#!/usr/bin/env python3
"""
Argos Translate dil paketlerini indir.
AirSpeak'in 20 hedef dilinden Argos destekleyenler için.

Çalıştır:
  pip install argostranslate
  python scripts/i18n/install-argos-langs.py
"""
import argostranslate.package
import argostranslate.translate

TARGET_LANGS = [
    'en', 'tr', 'ar', 'fa', 'de', 'fr', 'es', 'it', 'pt', 'nl',
    'pl', 'el', 'zh', 'ja', 'ko', 'hi', 'id', 'ru'
    # 'th', 'ms' — Argos henüz desteklemiyor
]

print('📦 Argos Translate dil paketleri indiriliyor...')
print('Toplam ~2GB disk + 30 dakika tahmini')
print('İlk çalıştırmada uzun, sonra hızlı.\n')

argostranslate.package.update_package_index()
available = argostranslate.package.get_available_packages()

installed_count = 0
failed_count = 0

for pkg in available:
    if pkg.from_code == 'en' and pkg.to_code in TARGET_LANGS:
        try:
            print(f'⬇️  Installing en→{pkg.to_code}...')
            argostranslate.package.install_from_path(pkg.download())
            installed_count += 1
            print(f'   ✅ Done')
        except Exception as e:
            print(f'   ❌ Failed: {e}')
            failed_count += 1

print(f'\n✅ {installed_count} paket kuruldu, {failed_count} başarısız')

# Test
print('\n🧪 Test çevirisi:')
test_text = 'cleared for takeoff'
for lang in ['tr', 'de', 'fr', 'es', 'ar']:
    try:
        result = argostranslate.translate.translate(test_text, 'en', lang)
        print(f'  en→{lang}: "{test_text}" = "{result}"')
    except Exception as e:
        print(f'  en→{lang}: Failed ({e})')

print('\n🎉 Hazır! Şimdi şunu çalıştırabilirsin:')
print('  npm run translate:argos')
