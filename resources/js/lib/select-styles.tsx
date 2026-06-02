import React from 'react';
import { components } from 'react-select';
import type { StylesConfig } from 'react-select';

export const HideGroupHeading = (props: any) => {
    return (
        <div
            className="collapse-group-heading"
            onClick={() => {
                const groupElement = document.querySelector(`#${props.id}`)?.parentElement?.parentElement;

                if (groupElement) {
                    groupElement.classList.toggle('collapsed-group');
                }
            }}
        >
            <components.GroupHeading {...props} />
        </div>
    );
};

export const HideGroupMenuList = (props: any) => {
    const new_props = {
        ...props,
        children: Array.isArray(props.children)
            ? props.children.map((c: any) => {
                return { ...c, props: { ...c.props, className: 'collapsed-group' } };
            })
            : props.children,
    };

    return <components.MenuList {...new_props} />;
};

export const reactSelectStyles: StylesConfig<any, false> = {
    control: (base, state) => {
        const hasError = (state.selectProps as any).ariaInvalid || (state.selectProps as any)['aria-invalid'];

        return {
            ...base,
            backgroundColor: 'transparent',
            borderColor: hasError
                ? '#B42043'
                : state.isFocused ? 'var(--ring)' : 'var(--input)',
            borderRadius: 'var(--radius)',
            minHeight: '36px',
            height: '36px',
            boxShadow: hasError
                ? '0 0 0 3px rgba(180, 32, 67, 0.2)'
                : state.isFocused ? '0 0 0 3px color-mix(in srgb, var(--ring) 50%, transparent)' : 'var(--shadow-xs)',
            transition: 'all 0.15s ease-in-out',
            outline: 'none',
            '&:hover': {
                borderColor: hasError
                    ? '#B42043'
                    : state.isFocused ? 'var(--ring)' : 'var(--input)',
            }
        };
    },
    valueContainer: (base) => ({
        ...base,
        padding: '0 12px',
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: 'var(--background)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-md)',
        zIndex: 9999,
        marginTop: '4px',
        overflow: 'hidden',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (base) => ({
        ...base,
        padding: '4px',
        backgroundColor: 'var(--background)',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#B42043'
            : state.isFocused
                ? '#243040'
                : 'transparent',
        color: state.isSelected || state.isFocused
            ? '#FFFFFF'
            : 'var(--foreground)',
        padding: '8px 12px',
        fontSize: '0.875rem',
        borderRadius: '10px',
        marginBottom: '4px',
        '&:active': {
            backgroundColor: state.isSelected ? '#B42043' : '#243040'
        },
        cursor: 'pointer'
    }),
    group: (base) => ({
        ...base,
        padding: '4px 0',
    }),
    groupHeading: (base) => ({
        ...base,
        color: '#B42043',
        backgroundColor: 'transparent',
        fontWeight: '700',
        textTransform: 'none',
        fontSize: '14px',
        padding: '0',
        margin: 0,
        cursor: 'pointer',
        borderBottom: 'none',
        '&:hover': {
            backgroundColor: 'transparent'
        }
    }),
    placeholder: (base) => ({
        ...base,
        color: 'var(--muted-foreground)',
        fontSize: '0.875rem',
    }),
    singleValue: (base) => ({
        ...base,
        color: 'var(--foreground)',
        fontSize: '0.875rem',
    }),
    input: (base) => ({
        ...base,
        color: 'var(--foreground)',
        fontSize: '0.875rem',
    }),
    indicatorSeparator: () => ({
        display: 'none'
    }),
    dropdownIndicator: (base) => ({
        ...base,
        color: 'var(--muted-foreground)',
        padding: '0 8px 0 0',
        '&:hover': {
            color: 'var(--foreground)'
        }
    }),
    clearIndicator: (base) => ({
        ...base,
        padding: '0 4px',
    })
};
