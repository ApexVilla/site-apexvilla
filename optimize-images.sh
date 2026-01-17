#!/bin/bash
# ============================================
# ApexVilla - Script de Otimização de Imagens
# ============================================
# Este script otimiza todas as imagens PNG e JPEG
# convertendo para WebP (próxima geração) e comprimindo originais

echo "🚀 Iniciando otimização de imagens..."

cd "$(dirname "$0")/images" || exit 1

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se os comandos necessários estão instalados
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp não encontrado. Instale com: sudo apt install webp"
    exit 1
fi

if ! command -v optipng &> /dev/null; then
    echo "⚠️  optipng não encontrado. Instale com: sudo apt install optipng"
    echo "Continuando sem otimização PNG..."
fi

if ! command -v jpegoptim &> /dev/null; then
    echo "⚠️  jpegoptim não encontrado. Instale com: sudo apt install jpegoptim"
    echo "Continuando sem otimização JPEG..."
fi

total_before=0
total_after=0

echo ""
echo "${BLUE}📸 Processando PNGs...${NC}"
for img in *.png; do
  if [ -f "$img" ]; then
    size_before=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
    total_before=$((total_before + size_before))
    
    # Converter para WebP (qualidade 85%)
    webp_output="${img%.png}.webp"
    if cwebp -q 85 "$img" -o "$webp_output" -quiet 2>/dev/null; then
      webp_size=$(stat -f%z "$webp_output" 2>/dev/null || stat -c%s "$webp_output" 2>/dev/null)
      total_after=$((total_after + webp_size))
      echo "  ✅ $img → $webp_output ($(numfmt --to=iec-i --suffix=B $webp_size))"
    fi
    
    # Otimizar PNG original
    if command -v optipng &> /dev/null; then
      optipng -o7 -quiet "$img" 2>/dev/null
      size_after=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
      total_after=$((total_after + size_after))
    fi
  fi
done

echo ""
echo "${BLUE}📸 Processando JPEGs...${NC}"
for img in *.jpg *.jpeg; do
  if [ -f "$img" ]; then
    size_before=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
    total_before=$((total_before + size_before))
    
    # Converter para WebP
    webp_output="${img%.*}.webp"
    if cwebp -q 85 "$img" -o "$webp_output" -quiet 2>/dev/null; then
      webp_size=$(stat -f%z "$webp_output" 2>/dev/null || stat -c%s "$webp_output" 2>/dev/null)
      total_after=$((total_after + webp_size))
      echo "  ✅ $img → $webp_output ($(numfmt --to=iec-i --suffix=B $webp_size))"
    fi
    
    # Otimizar JPEG original
    if command -v jpegoptim &> /dev/null; then
      jpegoptim --max=85 --strip-all --quiet "$img" 2>/dev/null
      size_after=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
      total_after=$((total_after + size_after))
    fi
  fi
done

# Calcular economia
if [ $total_before -gt 0 ]; then
  reduction=$((100 - (total_after * 100 / total_before)))
  echo ""
  echo "${GREEN}✨ Otimização concluída!${NC}"
  echo "📊 Redução total: ${reduction}% ($(numfmt --to=iec-i --suffix=B $total_before) → $(numfmt --to=iec-i --suffix=B $total_after))"
else
  echo ""
  echo "${GREEN}✅ Processamento concluído!${NC}"
fi

echo ""
echo "💡 Próximo passo: Atualize as tags <img> no HTML para usar <picture> com WebP"
