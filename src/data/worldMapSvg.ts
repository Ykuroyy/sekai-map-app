export interface CountryPath {
  id: string;
  name: string;
  path: string;
}

export const worldMapPaths: CountryPath[] = [
  // 北アメリカ
  {
    id: 'US',
    name: 'United States',
    path: 'M200 150 L450 150 L450 220 L420 220 L420 240 L400 240 L400 260 L380 260 L380 240 L360 240 L360 220 L200 220 Z M400 120 L430 120 L430 140 L400 140 Z'
  },
  {
    id: 'CA',
    name: 'Canada',
    path: 'M200 80 L450 80 L450 140 L430 140 L420 130 L410 140 L400 130 L390 140 L380 130 L370 140 L360 130 L350 140 L340 130 L330 140 L320 130 L310 140 L300 130 L290 140 L280 130 L270 140 L260 130 L250 140 L240 130 L230 140 L220 130 L210 140 L200 130 Z'
  },
  {
    id: 'MX',
    name: 'Mexico',
    path: 'M200 240 L320 250 L310 270 L300 290 L280 300 L260 310 L240 300 L220 290 L210 270 L200 250 Z'
  },
  
  // 南アメリカ
  {
    id: 'BR',
    name: 'Brazil',
    path: 'M300 320 L380 330 L400 360 L410 400 L400 440 L380 470 L350 490 L320 500 L290 490 L260 470 L240 440 L230 400 L240 360 L260 330 Z'
  },
  {
    id: 'AR',
    name: 'Argentina',
    path: 'M280 490 L320 500 L330 530 L325 570 L320 610 L310 640 L300 650 L290 640 L280 610 L275 570 L280 530 Z'
  },
  {
    id: 'CL',
    name: 'Chile',
    path: 'M250 480 L270 485 L275 510 L270 540 L275 570 L270 600 L275 630 L270 660 L260 670 L250 660 L245 630 L250 600 L245 570 L250 540 L245 510 Z'
  },
  
  // ヨーロッパ
  {
    id: 'GB',
    name: 'United Kingdom',
    path: 'M470 120 L490 120 L495 140 L490 160 L485 180 L480 200 L475 180 L470 160 L465 140 Z'
  },
  {
    id: 'FR',
    name: 'France',
    path: 'M480 180 L510 190 L520 210 L515 230 L500 240 L485 235 L475 220 L480 200 Z'
  },
  {
    id: 'DE',
    name: 'Germany',
    path: 'M520 160 L540 170 L545 190 L540 210 L535 230 L525 240 L515 235 L510 220 L515 200 L520 180 Z'
  },
  {
    id: 'IT',
    name: 'Italy',
    path: 'M520 220 L530 230 L535 250 L530 270 L525 290 L530 310 L535 330 L530 350 L525 340 L520 320 L515 300 L510 280 L505 260 L510 240 L515 220 Z'
  },
  {
    id: 'ES',
    name: 'Spain',
    path: 'M460 220 L500 230 L505 250 L500 270 L480 275 L460 270 L445 260 L440 240 L445 230 Z'
  },
  {
    id: 'RU',
    name: 'Russia',
    path: 'M550 80 L800 80 L800 120 L780 130 L760 125 L740 130 L720 125 L700 130 L680 125 L660 130 L640 125 L620 130 L600 125 L580 130 L560 125 L550 120 Z'
  },
  
  // アジア
  {
    id: 'CN',
    name: 'China',
    path: 'M700 180 L780 170 L800 190 L790 220 L770 240 L750 235 L730 240 L710 235 L690 240 L670 235 L650 240 L650 220 L670 200 L690 190 Z'
  },
  {
    id: 'IN',
    name: 'India',
    path: 'M650 250 L690 260 L700 280 L695 300 L690 320 L685 340 L690 360 L685 380 L680 370 L675 350 L670 330 L665 310 L660 290 L655 270 Z'
  },
  {
    id: 'JP',
    name: 'Japan',
    path: 'M820 200 L835 210 L840 230 L835 250 L830 240 L825 220 Z M825 260 L840 270 L845 290 L840 310 L835 300 L830 280 Z'
  },
  {
    id: 'KR',
    name: 'South Korea',
    path: 'M800 220 L810 230 L815 250 L810 270 L805 260 L800 240 Z'
  },
  {
    id: 'TH',
    name: 'Thailand',
    path: 'M720 300 L730 310 L735 330 L730 350 L725 370 L720 390 L715 370 L710 350 L715 330 L720 310 Z'
  },
  {
    id: 'ID',
    name: 'Indonesia',
    path: 'M730 380 L770 390 L780 400 L775 420 L760 430 L740 425 L720 430 L705 420 L710 400 L720 390 Z'
  },
  
  // アフリカ
  {
    id: 'EG',
    name: 'Egypt',
    path: 'M530 280 L560 290 L565 310 L560 330 L555 350 L550 370 L545 350 L540 330 L535 310 L530 290 Z'
  },
  {
    id: 'ZA',
    name: 'South Africa',
    path: 'M520 520 L580 530 L590 550 L585 570 L570 580 L550 575 L530 580 L515 570 L510 550 L515 530 Z'
  },
  {
    id: 'NG',
    name: 'Nigeria',
    path: 'M480 360 L510 370 L515 390 L510 410 L505 430 L500 410 L495 390 L490 370 L485 360 Z'
  },
  {
    id: 'MA',
    name: 'Morocco',
    path: 'M450 280 L480 290 L485 310 L480 330 L475 350 L470 330 L465 310 L460 290 L455 280 Z'
  },
  
  // オセアニア
  {
    id: 'AU',
    name: 'Australia',
    path: 'M750 480 L820 490 L830 510 L825 530 L810 540 L790 535 L770 540 L750 535 L735 530 L740 510 Z'
  },
  {
    id: 'NZ',
    name: 'New Zealand',
    path: 'M860 520 L870 530 L875 550 L870 570 L865 560 L860 540 Z M875 580 L885 590 L890 610 L885 630 L880 620 L875 600 Z'
  },
  
  // 中東・その他
  {
    id: 'SA',
    name: 'Saudi Arabia',
    path: 'M580 300 L620 310 L625 330 L620 350 L615 370 L610 350 L605 330 L600 310 L595 300 Z'
  },
  {
    id: 'TR',
    name: 'Turkey',
    path: 'M540 240 L580 250 L585 270 L580 290 L575 280 L570 260 L565 250 L560 240 Z'
  }
];

export const worldMapViewBox = "0 0 900 700";

export function getCountryPath(countryId: string): CountryPath | undefined {
  return worldMapPaths.find(country => country.id === countryId);
}