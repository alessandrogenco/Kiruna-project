import { execSync } from 'child_process';

const type = process.argv[2];
const comp = process.argv[3];

let command = `jest --coverage`;

if (type) {
    if(type == "integration"){
        command += ` --testPathPattern=test_integration`;
    }
    else if(type == "unit"){
        command += ` --testPathPattern=test_unit`;
    }
    else{
        command += ` --testPathPattern=test_unit/${type}_tests`;
    }
    
    if(comp){
        command += `/${comp}.test.mjs`;
    }
}

process.env.NODE_ENV = 'test';

try {
    execSync(command, { stdio: 'inherit' });
} catch (error) {
    console.error(error.message);
    process.exit(error.status || 1);
}