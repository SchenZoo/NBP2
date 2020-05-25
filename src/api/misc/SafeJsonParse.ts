export function safeJsonParse(jsonData: any) {
  if (typeof jsonData !== "string") {
    return jsonData;
  }
  let data = jsonData;
  try {
    data = JSON.parse(jsonData);
  } catch (err) {}
  return data;
}
