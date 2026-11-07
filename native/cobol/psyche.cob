       >>SOURCE FORMAT FREE
*> SPDX-License-Identifier: Apache-2.0
identification division.
program-id. psyche.
environment division.
configuration section.
repository. function all intrinsic.
data division.
working-storage section.
01 argument-count binary-long.
01 argument-text pic x(256).
01 feature-count binary-long.
01 echo-count binary-long.
01 result-score binary-long.
01 printed-score pic Z9.
procedure division.
    accept argument-count from argument-number
    if argument-count not = 2
        move 2 to return-code
        goback
    end-if
    accept argument-text from argument-value
    perform validate-argument
    compute feature-count = function numval(argument-text)
    accept argument-text from argument-value
    perform validate-argument
    compute echo-count = function numval(argument-text)
    compute result-score = feature-count * 11 + echo-count * 7
    if feature-count > 0 add 35 to result-score end-if
    if result-score > 99 move 99 to result-score end-if
    move result-score to printed-score
    display function trim(printed-score) " 0"
    move 0 to return-code
    goback.
validate-argument.
    if function length(function trim(argument-text trailing)) not = 1
        or argument-text(1:1) < '0' or argument-text(1:1) > '8'
        move 2 to return-code
        stop run
    end-if.
