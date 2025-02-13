; Put your Z80 assembly code into code files
Start:
    .model Spectrum48
	.org #8000
	ld a,2;	      ; upper screen
	call #1601    ; open the channel
	ld hl,Message ; HL points the the message string
NextCh:
	ld a,(hl)     ; get next character
	or a
	jp z,#12a9    ; jump back to main cycle when terminated
	rst #10       ; display character
	inc hl        ; next character
	jr NextCh     ; next loop

Message:
	.dm "\a\x0A\x06" ; AT 10, 4
	.dm "\p\x04"     ; PAPER 4
	.dm "Welcome to Klive IDE"
	.db 0x00         ; terminate
