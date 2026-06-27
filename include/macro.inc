.macro glabel label
    .global \label
    \label:
.endm
.macro dlabel label
    .global \label
    \label:
.endm
.macro jlabel label
    .global \label
    \label:
.endm
.macro nonmatching label, size
.endm
.macro endlabel label
.endm
