import {ValidationArguments} from "class-validator";

export const lengthValidationMessage = (args: ValidationArguments)=>{
    if (args.constraints.length === 2){
        return `${args.property}은 ${args.constraints[0]}~${args.constraints[1]}자 사이로 입력해주세요.`;
    } else {
        return `${args.property}은 최소 ${args.constraints[0]}자를 입력해주세요.`
    }
}