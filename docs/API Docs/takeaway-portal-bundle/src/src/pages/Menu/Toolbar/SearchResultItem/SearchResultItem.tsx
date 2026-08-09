import React from 'react';
import classes from './SearchResultItem.module.scss';
import { MenuSearchResult, useSearchFilterValue } from '@lo/shared/store/menuSearchFilter';
import { splitStringAtTarget } from '@lo/shared/helpers/string/splitStringAtTarget';
import classNames from 'classnames';

type SearchResultItemProps = {
    result: MenuSearchResult;
    containerClassName?: string;
    onClick?: (name: string) => void;
};

const SearchResultItem: React.FC<SearchResultItemProps> = (props) => {
    const { result, containerClassName, onClick } = props;
    const value = useSearchFilterValue();

    const itemCode = splitStringAtTarget(`${result.id} ${result.code ? '#' + result.code : ''}`, value) || [];
    const itemName = splitStringAtTarget(`${result.name}`, value);

    const isCodeVisible = itemCode.some((code) => code.text.toLowerCase().includes(value.toLowerCase()));

    return (
        <div
            className={containerClassName ? containerClassName : classes.searchResultsItem}
            onClick={() => onClick && onClick(result.name)}
            data-testid={`search-result-label-${result.id}`}
        >
            {isCodeVisible && (
                <div>
                    {itemCode?.map((part) => (
                        <span
                            key={part.key}
                            className={classNames(classes.codeText, { [classes.highlightedText]: part.isHighlighted })}
                        >
                            {part.text}
                        </span>
                    ))}
                </div>
            )}
            <div>
                {itemName?.map((part) => (
                    <span
                        key={part.key}
                        className={classNames(classes.additionalText, { [classes.highlightedText]: part.isHighlighted })}
                    >
                        {part.text}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default SearchResultItem;
