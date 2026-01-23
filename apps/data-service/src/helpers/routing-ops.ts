import type { LinkSchemaType } from "@repo/data-ops/zod-schema/links";

/**
 * 根据国家代码获取目标 URL
 * @param linkInfo - 链接信息对象
 * @param countryCode - 可选的国家代码（如 "US", "CN", "MY"）
 * @returns 目标 URL
 */
export function getDestinationForCountry(
  linkInfo: LinkSchemaType,
  countryCode?: string
): string {
  // 如果没有提供国家代码，返回默认目的地
  if (!countryCode) {
    return linkInfo.destinations.default;
  }

  // 检查国家代码是否存在于 destinations 中
  if (linkInfo.destinations[countryCode]) {
    return linkInfo.destinations[countryCode];
  }

  // 回退到默认目的地
  return linkInfo.destinations.default;
}
