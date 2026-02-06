export type BusinessAnalyst = {
  domainId: string
  name: string
}

export const businessAnalysts: BusinessAnalyst[] = [
  { domainId: "AL50044", name: "Asha" },
  { domainId: "AL47104", name: "Balu, Prakash" },
  { domainId: "AH21746", name: "Govardhan, Chavala" },
  { domainId: "AG26245", name: "Kumar R, Kishor" },
  { domainId: "AG66094", name: "Madani, Mohammed" },
  { domainId: "AH47129", name: "Mahapatra, Susmita" },
  { domainId: "AG24670", name: "Raj, Vikram" },
  { domainId: "AG54727", name: "S N, Sindhu" },
  { domainId: "AL99289", name: "Varshney, Juganu" },
  { domainId: "AG54455", name: "Machannagari, Jaipal Reddy" },
]

export const getBAByDomainId = (domainId: string) => {
  return businessAnalysts.find((ba) => ba.domainId === domainId)
}

export const getBAByName = (name: string) => {
  return businessAnalysts.find((ba) => ba.name === name)
}
