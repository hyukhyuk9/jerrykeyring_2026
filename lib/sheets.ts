// Google Sheets CSV parser - 서버사이드 전용
export interface TrackData {
  date: string;
  nfc: string;
  name: string;
  phone: string;
  genre: string;
  story: string;
  lyrics: string;
  status: string;
}

// CSV 파싱 (간단한 구현 - 따옴표 내 줄바꿈 지원)
function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(current);
        current = '';
      } else if (char === '\n' || (char === '\r' && next === '\n')) {
        row.push(current);
        current = '';
        if (row.length > 1) rows.push(row);
        row = [];
        if (char === '\r') i++;
      } else {
        current += char;
      }
    }
  }
  // Last row
  if (current || row.length > 0) {
    row.push(current);
    if (row.length > 1) rows.push(row);
  }

  return rows;
}

export async function fetchSheetData(): Promise<TrackData[]> {
  const url = process.env.GOOGLE_SHEET_CSV_URL;
  if (!url) {
    console.error('GOOGLE_SHEET_CSV_URL is not set');
    return [];
  }

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 }, // 60초 캐시
    });

    if (!response.ok) {
      throw new Error(`Sheet fetch failed: ${response.status}`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    // 첫 줄은 헤더, 나머지가 데이터
    // 헤더: 시리얼, 날짜, NFC, 이름, 번호, 장르, 이야기, 가사, 수정
    const dataRows = rows.slice(1);

    return dataRows.map(row => ({
      date: row[1] || '',
      nfc: row[2] || '',
      name: row[3] || '',
      phone: row[4] || '',
      genre: row[5] || '',
      story: row[6] || '',
      lyrics: row[7] || '',
      status: row[8] || '',
    }));
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [];
  }
}

export async function getTrackByNfc(nfcId: string): Promise<TrackData | null> {
  const data = await fetchSheetData();
  return data.find(d => d.nfc === nfcId) || null;
}

// 보안: 클라이언트에 반환할 때 개인정보 제거
export function sanitizeForClient(track: TrackData) {
  // 가사가 있으면 음원이 등록된 것으로 판단
  // "수정" 컬럼은 수정된 가사를 포함 (상태값이 아님)
  const hasLyrics = !!track.lyrics && track.lyrics.trim().length > 0;
  return {
    nfc: track.nfc,
    genre: track.genre,
    story: track.story, // 사연 데이터 추가
    lyrics: track.lyrics,
    status: track.status,
    hasMusic: hasLyrics,
  };
}
