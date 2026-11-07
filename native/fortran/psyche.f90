! SPDX-License-Identifier: Apache-2.0
program psyche
  implicit none
  character(len=1) :: a, b
  integer :: la, lb, s, e, result
  if (command_argument_count() /= 2) stop 2
  call get_command_argument(1, a, length=la)
  call get_command_argument(2, b, length=lb)
  if (la /= 1 .or. lb /= 1) stop 2
  if (a < '0' .or. a > '8' .or. b < '0' .or. b > '8') stop 2
  s = iachar(a) - iachar('0')
  e = iachar(b) - iachar('0')
  result = 11*s + 7*e
  if (s > 0) result = result + 35
  print '(I0,A)', min(99,result), ' 0'
end program psyche
