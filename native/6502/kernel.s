; SPDX-License-Identifier: Apache-2.0
; ca65 source. Load at $0600. $00=features, $01=echoes (both 0..8).
; $02=theatrical score, $03=evidence. BRK signals host completion.
.segment "CODE"
    lda #0
    sta $03
    ldx $00
    beq no_feature
    lda #35
feature_loop:
    clc
    adc #11
    dex
    bne feature_loop
no_feature:
    ldx $01
    beq clamp
echo_loop:
    clc
    adc #7
    dex
    bne echo_loop
clamp:
    cmp #99
    bcc save
    lda #99
save:
    sta $02
    brk
