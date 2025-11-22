/**
 * useCriteriaOrder Hook - Manage criteria ordering and sorting
 *
 * @purpose Handle criteria position management with local storage persistence
 * @design Supports both automatic sorting (by importance) and manual ordering (drag-and-drop)
 *
 * FEATURES:
 * - Toggle between importance-based sorting and manual ordering
 * - Persist custom positions in local storage per project
 * - Save positions when switching from manual to sorted mode
 * - Restore positions when switching back to manual mode
 */

import { useState, useCallback, useEffect } from 'react';
import { storageService } from '@/services/storageService';
import type { Criteria } from '@/components/VendorDiscovery';

interface CriteriaOrderState {
  // Map of category -> array of criterion IDs in custom order
  [category: string]: string[];
}

interface UseCriteriaOrderReturn {
  isSortedByImportance: boolean;
  toggleSorting: () => void;
  getOrderedCriteria: (criteria: Criteria[], category: string) => Criteria[];
  updateOrder: (category: string, orderedIds: string[]) => void;
  saveCurrentOrder: (criteria: Criteria[]) => void;
}

export const useCriteriaOrder = (projectId: string): UseCriteriaOrderReturn => {
  const storageKey = `criteria_order_${projectId}`;

  // Initialize sorting state (ON by default)
  const [isSortedByImportance, setIsSortedByImportance] = useState(() => {
    const saved = storageService.getItem<boolean>(`${storageKey}_sorting`);
    return saved ?? true; // Default to sorted by importance
  });

  // Initialize custom order state
  const [customOrder, setCustomOrder] = useState<CriteriaOrderState>(() => {
    const saved = storageService.getItem<CriteriaOrderState>(storageKey);
    return saved ?? {};
  });

  // Persist sorting preference
  useEffect(() => {
    storageService.setItem(`${storageKey}_sorting`, isSortedByImportance);
  }, [isSortedByImportance, storageKey]);

  // Persist custom order
  useEffect(() => {
    storageService.setItem(storageKey, customOrder);
  }, [customOrder, storageKey]);

  /**
   * Toggle between sorted and manual modes
   */
  const toggleSorting = useCallback(() => {
    setIsSortedByImportance(prev => !prev);
  }, []);

  /**
   * Save current criteria order for all categories
   * Called when switching from manual to sorted mode
   */
  const saveCurrentOrder = useCallback((criteria: Criteria[]) => {
    // Group criteria by type/category
    const orderByCategory: CriteriaOrderState = {};

    criteria.forEach(c => {
      if (!orderByCategory[c.type]) {
        orderByCategory[c.type] = [];
      }
      orderByCategory[c.type].push(c.id);
    });

    setCustomOrder(orderByCategory);
  }, []);

  /**
   * Update order for a specific category
   * Called after drag-and-drop reordering
   */
  const updateOrder = useCallback((category: string, orderedIds: string[]) => {
    setCustomOrder(prev => ({
      ...prev,
      [category]: orderedIds
    }));
  }, []);

  /**
   * Get criteria in the correct order based on current mode
   */
  const getOrderedCriteria = useCallback((criteria: Criteria[], category: string): Criteria[] => {
    if (isSortedByImportance) {
      // Sort by importance: High → Medium → Low → Archived
      const active = criteria.filter(c => !c.isArchived);
      const archived = criteria.filter(c => c.isArchived);

      const importanceOrder = { high: 3, medium: 2, low: 1 };
      const sortedActive = [...active].sort((a, b) =>
        importanceOrder[b.importance] - importanceOrder[a.importance]
      );

      return [...sortedActive, ...archived];
    } else {
      // Manual order: use saved positions
      const savedOrder = customOrder[category.toLowerCase()];

      if (!savedOrder || savedOrder.length === 0) {
        // No saved order, return as-is
        return criteria;
      }

      // Sort by saved position
      const orderedCriteria = [...criteria].sort((a, b) => {
        const indexA = savedOrder.indexOf(a.id);
        const indexB = savedOrder.indexOf(b.id);

        // Items not in saved order go to the end
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      });

      return orderedCriteria;
    }
  }, [isSortedByImportance, customOrder]);

  return {
    isSortedByImportance,
    toggleSorting,
    getOrderedCriteria,
    updateOrder,
    saveCurrentOrder
  };
};

export default useCriteriaOrder;
