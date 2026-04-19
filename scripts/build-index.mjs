import fs  from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

/*
 * Converts data/.*.csv into public/search-index.json
 * Copies CSV to public/search-data.csv for fallback download
 *
 * Handles: UTF-8 BOM | Multi-line quote fields, Windows line endings
 *          trailing spaces in headers
 */ 

// validate csv file location and name
const CSV_DIR = path.join(import.meta.dirname, '../data/');
const JSON_OUTPUT = path.join(import.meta.dirname, '../public/');

// load the files from CSV_DIR
async function findFilesByExt(dir, ext) {
  try {
    const files = await fs.readdir(dir);
    const matches = files.filter(f=>path.extname(f) === ext);
    return matches;

  } catch(error) {
    console.error(`Find Files Error: `, error.message);
  }
}

async function validateCSVInput() {
  try {
    const files = await findFilesByExt( CSV_DIR, '.csv' );
    console.log(`SUCCESS: found ${files.length} files.`);

  } catch(error) {
    console.error('CSV Read Error: ', error.message);
    throw new Error(`Unable to load .csv. Ensure it is available in ./data/`);
  }
}
validateCSVInput();

async function csv_parse(csv_path) {
  console.log('Building search index...');
  console.log('from ', csv_path);
  const csv = await fs.readFile(csv_path, 'utf-8');

  // Parse, handle edge cases
  const records = parse(csv, {
    columns: (h) => h.map(col=>col.trim()),
    skip_empty_lines: true,
    bom: true,
    relax_quotes: true,
    trim: true
  });

  console.log(`Parsed ${records.length} records`);
  
  const issuesFound = [];
  records.forEach((r,i)=>{
    const keys = Object.keys(r);
    for(let i = 0; i < keys.length; i++) {
      if(!r[keys[i]]) issuesFound.push(`Row ${i}: missing ${keys[i]}`);
    }
  });

  if(issuesFound.length > 0) {
    console.warn('\nWarnings found:');
    issuesFound.slice(0,10).forEach(iss=>console.warn(`   - ${iss}`));
    if(issuesFound.length > 10) {
      console.warn(`   ... and ${issuesFound.length - 10} more.`);
    }
  }
  return records;
}

async function writeJSONFile(file, json_path) {
    await fs.writeFile(json_path);
}

async function buildIndex(file, output_path) {
  console.log(file);
  const records = csv_parse(file);
  await fs.writeFile(output_path, JSON.stringify(records, null, 2), 'utf-8');
  console.log(`Generated ${output_path}`);
}

function copyCSVFallback(csv, csv_copy_path) {
  fs.copyFile(csv, csv_copy_path);
  console.log(`Copied ${csv_copy_path}`);
}

async function csvToJsonPipeline() {
  // get files
  const files = await findFilesByExt( CSV_DIR, '.csv');
  // loop through files
  for(let i = 0; i < files.length; i++) {
    console.log(files[i]); 
    const json_output_path = path.join(JSON_OUTPUT, path.parse(files[i]).name + '.json');
    const csv_copy_path = path.join(JSON_OUTPUT, path.basename(files[i]));
    const csv_input_path = path.join( CSV_DIR, files[i] );
    console.log(csv_input_path)
    buildIndex(csv_input_path, json_output_path);
    copyCSVFallback(csv_input_path, csv_copy_path);
    
    console.log('OUTPUT PATH: ', json_output_path);
    console.log('CSV OUTPUT PATH: ', csv_copy_path);
  }
}
csvToJsonPipeline();
console.log('build complete!');
