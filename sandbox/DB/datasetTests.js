import data from './datasets.json' assert { type: 'json' };
import _ from 'lodash';

const { 
    dataset1: both_mixed_dataset1,
    dataset2: both_mixed_dataset2,
} = data.both_mixed

const {
    dataset1: only_columns_mixed_dataset1,
    dataset2: only_columns_mixed_dataset2,
} = data.only_columns_mixed

const {
    dataset1: only_rows_mixed_dataset1,
    dataset2: only_rows_mixed_dataset2,
} = data.only_rows_mixed

const {
    dataset1: neither_mixed_dataset1,
    dataset2: neither_mixed_dataset2,
} = data.neither_mixed

const DATABASE_QUERY_OUTPUT_TEST = {
    MATCH_OUTPUT: 'MATCH_OUTPUT',
    IGNORE_COLUMN_ORDER: 'IGNORE_COLUMN_ORDER',
    IGNORE_ROW_ORDER: 'IGNORE_ROW_ORDER',
    IGNORE_COLUMN_AND_ROW_ORDER: 'IGNORE_COLUMN_AND_ROW_ORDER',
};

// Sort columns and rearrange columns in each row
const sortDatasetColumns = (dataset) => {
    const sortedColumns = [...dataset.columns].sort((a, b) => a.name.localeCompare(b.name));
    const colIndexMapping = {};

    for (let i = 0; i < sortedColumns.length; i++) {
        colIndexMapping[sortedColumns[i].name] = dataset.columns.findIndex(col => col.name === sortedColumns[i].name);
    }

    const sortedRows = dataset.rows.map(row => {
        const newRow = [];
        sortedColumns.forEach((col, index) => {
        newRow[index] = row[colIndexMapping[col.name]];
        });
        return newRow;
    });

    return {
        columns: sortedColumns,
        rows: sortedRows
    };
}

// Sort rows based on the values in the rows
const sortDatasetRows = (dataset) => {
    const sortedRows = [...dataset.rows].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    return {
        columns: dataset.columns,
        rows: sortedRows
    };
}

const areDatasetsEquivalent = (d1, d2, outputTest) => {

    switch(outputTest) {

        case DATABASE_QUERY_OUTPUT_TEST.IGNORE_COLUMN_ORDER:
            d1 = sortDatasetColumns(d1);
            d2 = sortDatasetColumns(d2);
            break;

        case DATABASE_QUERY_OUTPUT_TEST.IGNORE_ROW_ORDER:
            d1 = sortDatasetRows(d1);
            d2 = sortDatasetRows(d2);
            break;

        case DATABASE_QUERY_OUTPUT_TEST.IGNORE_COLUMN_AND_ROW_ORDER:
            d1 = sortDatasetColumns(d1);
            d2 = sortDatasetColumns(d2);
            d1 = sortDatasetRows(d1);
            d2 = sortDatasetRows(d2);
            break;
        case DATABASE_QUERY_OUTPUT_TEST.MATCH_OUTPUT:
            break;
        default:
            return false;
    }


    return _.isEqual(d1, d2);
}

console.log("\n----- START OF TESTS -----\n");

function runTests() {
    const datasets = [
        { name: "Both Mixed", dataset1: both_mixed_dataset1, dataset2: both_mixed_dataset2 },
        { name: "Only Columns Mixed", dataset1: only_columns_mixed_dataset1, dataset2: only_columns_mixed_dataset2 },
        { name: "Only Rows Mixed", dataset1: only_rows_mixed_dataset1, dataset2: only_rows_mixed_dataset2 },
        { name: "Neither Mixed", dataset1: neither_mixed_dataset1, dataset2: neither_mixed_dataset2 },
    ];

    const tests = Object.values(DATABASE_QUERY_OUTPUT_TEST);

    datasets.forEach(({ name, dataset1, dataset2 }) => {
        console.log(`\n-- Testing Scenario: ${name} --`);
        
        tests.forEach(test => {
            const result = areDatasetsEquivalent(dataset1, dataset2, test);
            console.log(`Test used: ${test} \t\t\t`,  result ? "Passed" : "Failed");
        });
    });
}

runTests();


console.log("\n----- END OF TESTS -----\n");
