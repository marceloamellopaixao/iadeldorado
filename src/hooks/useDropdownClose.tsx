import { useEffect, useRef, useState } from "react";

type DropdownKey = string;

export const useDropdownClose = () => {
    const [dropdownStates, setDropdownStates] = useState<Record<DropdownKey, boolean>>({});
    const dropdownRefs = useRef<Record<DropdownKey, HTMLDivElement | null>>({});

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const newStates = { ...dropdownStates };

            for (const key of Object.keys(dropdownRefs.current)) {
                const ref = dropdownRefs.current[key];
                if (ref && !ref.contains(event.target as Node)) {
                    newStates[key] = false;
                }
            }

            setDropdownStates(newStates);
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownStates]);

    const setDropdownRef = (key: DropdownKey, ref: HTMLDivElement | null) => {
        dropdownRefs.current[key] = ref;
    };

    const toggleDropdown = (key: DropdownKey) => {
        setDropdownStates(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const closeDropdown = (key: DropdownKey) => {
        setDropdownStates(prev => ({
            ...prev,
            [key]: false,
        }));
    };

    const openDropdown = (key: DropdownKey) => {
        setDropdownStates(prev => ({
            ...prev,
            [key]: true,
        }));
    };

    return {
        dropdownStates,
        setDropdownRef,
        toggleDropdown,
        closeDropdown,
        openDropdown
    };
};
