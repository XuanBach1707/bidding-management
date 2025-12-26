import { useState, useEffect } from "react";
import { organizationApi, UnitMember } from "@/entities/organization";

export const useUnitMembers = (unitId?: number | null) => {
  const [members, setMembers] = useState<UnitMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!unitId) {
      setMembers([]);
      return;
    }

    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const data = await organizationApi.getUnitMembers(unitId);
        setMembers(data);
      } catch (error) {
        console.error("Failed to fetch unit members:", error);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [unitId]);

  return { members, isLoading };
};