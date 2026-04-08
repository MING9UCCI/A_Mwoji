const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

export async function generateQuestionAndAnswer() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `대학생이 공부하다 갑자기 궁금해질 만한 엉뚱하고 흥미로운 일상 질문 1개를 만들어줘.
예시: '펭귄이 날지 못하는 이유는?', '서울 맥도날드에 드라이브스루가 없는 이유는?'
질문(question)과 그에 대한 3줄 이내의 쉽고 재밌는 정답설명(answer)을 JSON 형식으로 반환해.
반드시 아래 JSON 형식만 반환해:
{
  "question": "질문 내용 (30자 이내)",
  "answer": "정답 및 해설 내용 (3줄 이내, 대학생 말투)"
}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate from Gemini API');
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  
  // 마크다운 블록(```json ... ```) 제거 후 파싱
  const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  
  return JSON.parse(cleanText) as { question: string; answer: string };
}
