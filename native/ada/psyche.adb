-- SPDX-License-Identifier: Apache-2.0
with Ada.Command_Line; use Ada.Command_Line;
with Ada.Text_IO; use Ada.Text_IO;
procedure Psyche is
   S, E, Result : Integer;
   function Valid (Text : String) return Boolean is
     (Text'Length = 1 and then Text (Text'First) in '0' .. '8');
begin
   if Argument_Count /= 2 or else not Valid (Argument (1))
     or else not Valid (Argument (2)) then
      Set_Exit_Status (2);
      return;
   end if;
   S := Integer'Value (Argument (1));
   E := Integer'Value (Argument (2));
   Result := S * 11 + E * 7;
   if S > 0 then Result := Result + 35; end if;
   Result := Integer'Min (99, Result);
   Put_Line (Integer'Image (Result) & " 0");
end Psyche;
