/* SPDX-License-Identifier: Apache-2.0 */
/* Linux x86-64 SysV, GNU assembler. Two single digit arguments (0..8). */
.intel_syntax noprefix
.section .rodata
fmt: .asciz "%d 0\n"
.text
.global main
.type main, @function
main:
    push rbp
    mov rbp, rsp
    cmp edi, 3
    jne invalid
    mov rdx, [rsi + 8]
    cmp byte ptr [rdx + 1], 0
    jne invalid
    movzx ecx, byte ptr [rdx]
    sub ecx, 48
    cmp ecx, 8
    ja invalid
    mov rdx, [rsi + 16]
    cmp byte ptr [rdx + 1], 0
    jne invalid
    movzx edx, byte ptr [rdx]
    sub edx, 48
    cmp edx, 8
    ja invalid
    imul esi, ecx, 11
    imul edx, edx, 7
    add esi, edx
    test ecx, ecx
    jz clamp
    add esi, 35
clamp:
    mov edx, 99
    cmp esi, edx
    cmovg esi, edx
    lea rdi, [rip + fmt]
    xor eax, eax
    call printf@PLT
    xor eax, eax
    leave
    ret
invalid:
    mov eax, 2
    leave
    ret
.size main, .-main
.section .note.GNU-stack,"",@progbits
