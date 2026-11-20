import type { FamilyMember } from '../types/family'
import treeJson from '../../public/data/family-tree.json'

/**
 * Dữ liệu cây gia phả được nạp trực tiếp từ file JSON duy nhất:
 * public/data/family-tree.json
 *
 * Mọi thay đổi về dữ liệu gia phả sẽ tập trung tại file JSON này.
 */
export const INITIAL_FAMILY_TREE: FamilyMember[] = treeJson as unknown as FamilyMember[]
