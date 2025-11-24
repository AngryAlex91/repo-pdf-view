
export type LLM_Response = {
  answer: string
  sources: { page: number, text: string }[]
}

// This is for PDF/JSON 1
export async function generateAnswer1(): Promise<LLM_Response> {
  return {
    answer: "some answer 1",
    sources: [
      { page: 6, text: "発電量は概ね予測の範囲内で着地" }
    ]
  }
}

// This is for PDF/JSON 2
export async function generateAnswer2(): Promise<LLM_Response> {
  return {
    answer: "some answer 2",
    sources: [
      { page: 15, text: "磁性流体シール・ロータリージョイント・Ｏリング・金属ベローズを組み合わせ、ユニット化した製品。電源、信号、高周波電源用等、様々な用途に対応し、取り扱い性の向上、コンパクト化に貢献します" },
      { page: 22, text: "持続可能な社会の実現に向けて取り組むことが企業の責務であると考えています" }
    ]
  }
}

// This is for PDF/JSON 3
export async function generateAnswer3(): Promise<LLM_Response> {
  return {
    answer: "some answer 3 ",
    sources: [
      { page: 4, text: "4,706" },
      { page: 6, text: "ESGに関する取組みの継続的かつ組織的な実践を目的として「サステナビリティ推進委員" }
    ]
  }
}
