import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

// table components
import Header from './TableHeader';
import Heading from './TableHeading';
import Body from './TableBody';
import Row from './TableRow';
import Data from './TableData';

const sortDirection = {
    ASC: 'asc',
    DESC: 'desc'
};

class Table extends Component {
    static getDerivedStateFromProps(nextProps) {
        return {
            data: nextProps.data,
            sortBy: {}
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            sortBy: {}
        };
    }

    _sortDescending({ key, sortCompareDesc }) {
        const data = [...this.props.data];

        const shouldSortByAlpha = typeof data[0][key] === 'string'; // assumes data consistency across array items

        const sortCompareAlphaDesc = (a, b) => {
            if (!a[key]) return 1;
            if (!b[key]) return -1;
            const textA = a[key].toUpperCase();
            const textB = b[key].toUpperCase();
            return textA < textB ? 1 : textA > textB ? -1 : 0;
        };

        const sortedData = sortCompareDesc
            ? data.sort(sortCompareDesc)
            : shouldSortByAlpha
              ? data.sort(sortCompareAlphaDesc)
              : data.sort((a, b) => b[key] - a[key]);

        this.setState({
            data: sortedData,
            sortBy: { key, direction: sortDirection.DESC }
        });
    }

    _sortAscending({ key, sortCompareAsc }) {
        const data = [...this.props.data];

        const shouldSortByAlpha = typeof data[0][key] === 'string'; // assumes data consistency across array items

        const sortCompareAlphaAsc = (a, b) => {
            if (!a[key]) return -1;
            if (!b[key]) return 1;
            const textA = a[key].toUpperCase();
            const textB = b[key].toUpperCase();
            return textA < textB ? -1 : textA > textB ? 1 : 0;
        };

        const sortedData = sortCompareAsc
            ? data.sort(sortCompareAsc)
            : shouldSortByAlpha
              ? data.sort(sortCompareAlphaAsc)
              : data.sort((a, b) => a[key] - b[key]);

        this.setState({
            data: sortedData,
            sortBy: { key, direction: sortDirection.ASC }
        });
    }

    _sortColumn = config => {
        const { sortBy: { direction, key: stateKey } } = this.state;
        const { key } = config;

        const shouldSortDesc = direction === sortDirection.ASC && key === stateKey;

        return shouldSortDesc ? this._sortDescending(config) : this._sortAscending(config);
    };

    renderTable({ columns, isStriped, isInverse, hasHeader, onRowClick, isSecondary }) {
        const { sortBy, data } = this.state;
        return (
            <Fragment>
                {hasHeader && (
                    <Header>
                        <Row>
                            {columns.map((column, i) => {
                                const {
                                    sortCompareAsc,
                                    sortCompareDesc,
                                    disableSorting,
                                    onHeadingClick
                                } = column;
                                const reactKey = `row-${i}-key-${i}`;
                                const key = column.key || column;
                                const children = column.children || column;
                                const defaultCursor = disableSorting && !onHeadingClick;

                                const handleHeadingClick = disableSorting
                                    ? onHeadingClick ? onHeadingClick : undefined
                                    : event => {
                                          this._sortColumn({
                                              key,
                                              sortCompareAsc,
                                              sortCompareDesc
                                          });
                                          onHeadingClick && onHeadingClick(event);
                                      };

                                return (
                                    <Heading
                                        onClick={handleHeadingClick}
                                        key={reactKey}
                                        isSecondary={isSecondary}
                                        className={cx({ '-cursor--default': defaultCursor })}
                                        sortDirection={
                                            sortBy.key === key ? sortBy.direction : undefined
                                        }>
                                        {children}
                                    </Heading>
                                );
                            })}
                        </Row>
                    </Header>
                )}
                <Body>
                    {data.map((rowData, i) => (
                        <Row
                            key={`row-${i}`}
                            className={onRowClick && '-cursor--pointer'}
                            isInverse={isInverse}
                            isStriped={isStriped}
                            onClick={onRowClick && (() => onRowClick(rowData))}>
                            {columns.map((column, k) => {
                                const isString = typeof column === 'string';
                                const cellData = isString ? rowData[column] : rowData[column.key];
                                const decorator = column.dataCellDecorator;
                                const key = `row-${i}-key-${k}`;
                                return decorator ? (
                                    decorator(cellData, key, rowData)
                                ) : (
                                    <Data key={key}>{cellData}</Data>
                                );
                            })}
                        </Row>
                    ))}
                </Body>
            </Fragment>
        );
    }

    render() {
        const { data, className, children, size, isStriped, isInverse } = this.props;
        return (
            <table
                className={cx('gds-table', className, {
                    [`gds-table--${size}`]: size,
                    [`gds-table--inverse`]: isInverse,
                    [`gds-table--striped`]: isStriped && !isInverse,
                    [`gds-table--inverse-striped`]: isStriped && isInverse
                })}>
                {data ? this.renderTable(this.props) : children}
            </table>
        );
    }
}

Table.propTypes = {
    // necessary for controlled tables
    data: PropTypes.arrayOf(PropTypes.object),
    columns: PropTypes.arrayOf(
        PropTypes.oneOfType([
            // columns can be a simple array of strings representing the keys
            // or an object for customizations like unique titles, custom
            // ascending or descending sorts.
            PropTypes.string,
            // customizations
            PropTypes.shape({
                children: PropTypes.node,
                dataCellDecorator: PropTypes.func,
                disableSorting: PropTypes.bool,
                key: PropTypes.string,
                sortCompareAsc: PropTypes.func,
                sortCompareDesc: PropTypes.func,
                onHeadingClick: PropTypes.func
                // callback: PropTypes.func,
                // A callback could be used to request sorted data from the server,
                // for instance paginated items sorted by data.
            })
        ])
    ),

    children: PropTypes.node,
    className: PropTypes.string,
    hasHeader: PropTypes.bool,
    isInverse: PropTypes.bool,
    isSecondary: PropTypes.bool,
    isStriped: PropTypes.bool,
    onRowClick: PropTypes.func,
    size: PropTypes.oneOf(['sm', 'lg', 'xs', 'xl'])
};

Table.defaultProps = {
    hasHeader: true
};

export default Table;