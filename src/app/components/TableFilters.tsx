import { orderByOptions, sortByOptions } from '@/utils/constant';
import React from 'react';
import Select from 'react-select';
import { FiltersType, OrderByType, SortByType } from '../types';

interface TableFiltersProps {
    onChange: (value: FiltersType) => void;
    defaultSortByOption?: SortByType,
    defaultOrderByOption?: OrderByType,
    filters: FiltersType;
    setFilters: React.Dispatch<React.SetStateAction<FiltersType>>
}

export const TableFilters: React.FC<TableFiltersProps> = ({ filters, setFilters }) => {


    const options = orderByOptions

    return (
        <div className="flex items-center justify-start gap-3">
            <Select
                key={'sortBy'}
                placeholder="Sort By"
                value={sortByOptions.find((opt) => opt.value === filters.sortBy)}
                onChange={(newValue) => {
                    setFilters((prev) => ({
                        ...prev,
                        sortBy: newValue ? newValue.value as SortByType : null,
                    }));
                }}
                options={sortByOptions}
                isClearable
            />
            <Select
                key={'orderBy'}
                placeholder="Order By"
                value={options.find((opt) => opt.value === filters.orderBy)}
                onChange={(newValue) => {
                    setFilters((prev) => ({
                        ...prev,
                        orderBy: newValue ? newValue.value as OrderByType : null
                    }));
                }}
                options={orderByOptions}
                isClearable
            />

        </div>
    )
}
