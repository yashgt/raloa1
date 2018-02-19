drop table if exists corrections;
create table corrections
(
old varchar(500)
, new varchar(500)
)
;
insert into corrections(old,new)
values
("Stn.", "Station")
,("stn.", "Station")
,("Govt.", "Government")
/*,("St.", "Saint")*/
,("Jn.", "Junction")
,("Jn", "Junction")
,("K'tak", "Karnataka")
,("WT", "Water Treatment")
,("H.S.", "High School")
,("BUSSTAND", "Bus Stand")
,(" KTC Bus Stand","")
,(" Ferry Terminal","")
,(" Bus Stand MSRTC","")
,(" Bus Stand KSRTC","")
,(" bus Stand KSRTC","")
,(" CBT KSRTC","")
,("Goa Multi Faculty Collage","Goa Multi Faculty College")
,("Collage","College")
,("Hyderabad MG's CBT APSRTC","Hyderabad CBT")
;
