// lib/laptop-utils.ts - Utility untuk mapping gambar laptop, link marketplace, dan format mata uang
// Sesuai implementasi di proyek www (Laravel)

export function getLaptopImageUrl(brand?: string | null, name?: string | null, image?: string | null): string {
  if (image) {
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    if (image.startsWith('/')) {
      return image;
    }
    return `/${image}`;
  }

  const b = (brand ?? '').toLowerCase();
  const n = (name ?? '').toLowerCase();

  // 1. Acer
  if (b.includes('acer')) {
    if (n.includes('nitro') || n.includes('predator') || n.includes('aspire 7')) {
      return '/images/laptops/acer-nitro.jpg';
    }
    if (n.includes('travelmate') || n.includes('extensa')) {
      return '/images/laptops/black-business.jpg';
    }
    return '/images/laptops/acer-aspire.jpg';
  }

  // 2. ASUS
  if (b.includes('asus')) {
    if (n.includes('tuf') || n.includes('rog') || n.includes('zephyrus') || n.includes('gaming')) {
      return '/images/laptops/asus-tuf.jpg';
    }
    return '/images/laptops/asus-vivobook.jpg';
  }

  // 3. Lenovo
  if (b.includes('lenovo')) {
    if (
      n.includes('thinkpad') ||
      n.includes('t14') ||
      n.includes('t480') ||
      n.includes('t470') ||
      n.includes('t460') ||
      n.includes('t440') ||
      n.includes('x1 carbon') ||
      n.includes('x13') ||
      n.includes('x260') ||
      n.includes('x250') ||
      n.includes('l380') ||
      n.includes('l490') ||
      n.includes('l15') ||
      n.includes('e590') ||
      n.includes('500e')
    ) {
      return '/images/laptops/thinkpad.jpg';
    }
    if (n.includes('gaming') || n.includes('legion')) {
      return '/images/laptops/gaming-laptop.jpg';
    }
    return '/images/laptops/ideapad-slim.jpg';
  }

  // 4. Dell
  if (b.includes('dell')) {
    if (n.includes('xps')) {
      return '/images/laptops/dell-xps.jpg';
    }
    if (n.includes('alienware') || n.includes('g15') || n.includes('gaming')) {
      return '/images/laptops/gaming-laptop.jpg';
    }
    return '/images/laptops/dell-latitude.jpg';
  }

  // 5. HP
  if (b.includes('hp')) {
    if (n.includes('elitebook')) {
      return '/images/laptops/hp-elitebook.jpg';
    }
    if (n.includes('probook') || n.includes('4420s')) {
      return '/images/laptops/black-business.jpg';
    }
    if (n.includes('victus') || n.includes('omen') || n.includes('gaming')) {
      return '/images/laptops/gaming-laptop.jpg';
    }
    return '/images/laptops/hp-laptop.jpg';
  }

  // 6. MSI
  if (b.includes('msi')) {
    return '/images/laptops/msi-gaming.jpg';
  }

  // 7. Axioo
  if (b.includes('axioo')) {
    if (n.includes('pongo')) {
      return '/images/laptops/gaming-laptop.jpg';
    }
    return '/images/laptops/axioo-hype.jpg';
  }

  // 8. ADVAN
  if (b.includes('advan')) {
    if (n.includes('pixwar') || n.includes('gaming')) {
      return '/images/laptops/gaming-laptop.jpg';
    }
    return '/images/laptops/advan-laptop.jpg';
  }

  // 9. Apple / MacBook
  if (b.includes('macbook') || b.includes('apple') || n.includes('macbook') || n.includes('air') || n.includes('m1') || n.includes('m2') || n.includes('m3')) {
    return '/images/laptops/macbook.jpg';
  }

  // 10. Toshiba / Fujitsu
  if (b.includes('toshiba') || b.includes('fujitsu')) {
    return '/images/laptops/black-business.jpg';
  }

  // 11. Infinix / Samsung / Lainnya
  return '/images/laptops/silver-ultrabook.jpg';
}

export function formatRupiah(value: number | string | bigint): string {
  const num = typeof value === 'bigint' ? Number(value) : Number(value || 0);
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export function getMarketplaceLinks(brand?: string | null, name?: string | null) {
  const query = encodeURIComponent(`${brand ?? ''} ${name ?? ''}`.trim());
  return {
    shopee: `https://shopee.co.id/search?keyword=${query}`,
    tokopedia: `https://www.tokopedia.com/search?st=product&q=${query}`,
    facebook: `https://www.facebook.com/marketplace/search/?query=${query}`,
    blibli: `https://www.blibli.com/cari/${query}`,
  };
}
