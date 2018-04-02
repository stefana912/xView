import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Alert } from './Alert';
import { AlertService } from '../services/alert.service';
import { IncidentService } from '../services/incident.service';
import { TruncatePipe } from '../common/pipe.truncate';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss'],
  providers: [AlertService, IncidentService]

})

export class AlertsComponent implements OnInit , OnChanges{
  alert_put_values: { _id: string };
  title: any;
  alerts: Alert[] = [];
  display: boolean = false;
  cols2: any;
  eventid: any;
  alertselections: any[];
  status: any;
  public isincident: boolean;
  public colorval: string;
  public alert_trend;
  public widget_data;
  public assignees;
  assgneselections = [];
  assgneselectionsids = [];
  tenantID : string = "xxxxxx" ;

  user = {
    name: "",
    picture: "",
    tenantId: ""
  };

  //public alertsTable;
  visible: boolean = true;
  constructor(private alertsService: AlertService, private incidentService: IncidentService, private userService:UserService) {
    this.incidentService.getAssignees().subscribe(assignees => {

      for (var d of assignees.data) {
        this.assgneselections.push(d.name);
      }
      for (var d of assignees.data) {
        this.assgneselectionsids.push(d.id);
      }
      this.brands = this.assgneselections;
      this.brandids = this.assgneselectionsids;
      console.log(this.assignees)
    });

    this.userService.getUserData().subscribe(res => {
      var user = res;
      console.log(JSON.stringify(user.message[0].tenantId) + "----------++++  pasindu----------");
      this.tenantID = user.message[0].tenantId;
      this.alertsService.updateURLs(this.tenantID)
      
    });

    this.alertsService.getAlertTrends('12')

      .subscribe((data: any) => {
        this.alert_trend = data;
        //console.log(this.alert_trend);
      });

    this.alertsService.widgetStatus(this.tenantID).subscribe(widget_data1 => {
      this.widget_data = widget_data1;
      //console.log(this.widget_data)
    });

  }

  disabled: boolean = true;

  showDialog() {
    this.display = true;
  }

  ngOnChanges(changes: SimpleChanges){
    this.userService.getUserData().subscribe(res => {
      var user = res;
      console.log( JSON.stringify(user.message[0].tenantId) + "-----------------user pasindu----------")
      this.tenantID = user.message[0].tenantId;
      this.alertsService.updateURLs(this.tenantID)
      this.loadSortedAlerts();
    })
;
  }

  ngOnInit() {

    this.userService.getUserData().subscribe(res => {
      var user = res;
      console.log( JSON.stringify(user.message[0].tenantId) + "-----------------user pasindu----------")
      this.tenantID = user.message[0].tenantId;
      this.alertsService.updateURLs(this.tenantID)
      this.loadSortedAlerts();
    })

  }

  brands: string[];
  brandids: string[];

  filteredBrands: any[];
  brand: string;


  handleDropdownClick() {
    this.filteredBrands = [];

    setTimeout(() => {
      this.filteredBrands = this.brands;
    }, 100)
  }

  filterBrands(event) {
    this.filteredBrands = [];
    for (let i = 0; i < this.brands.length; i++) {
      let brand = this.brands[i]+ "|"+this.brandids[i];
      if (brand.toLowerCase().indexOf(event.query.toLowerCase()) == 0) {
        this.filteredBrands.push(brand);
      }
    }
  }

  loadSortedAlerts() {
    this.alertsService.getALertsMapped().then(alerts => {
      alerts.sort(function (a, b) {
        if (a._source.raisedTimestamp < b._source.raisedTimestamp) {
          return 1;
        }
        if (a._source.raisedTimestamp > b._source.raisedTimestamp) {
          return -1;
        }
        return 0;
      });
      this.alerts = alerts;
    });
  }

  onRowSelect(event) {
    this.showDialog();
    this.status = event.data._source.status.toUpperCase();
    this.title = event.data._source.title;
    this.eventid = event.data._source.eventId;
    this.cols2 = [
      { head: 'Event ID', val: event.data._source.eventId },
      { head: 'Domain', val: event.data._source.domain },
      { head: 'Producer', val: event.data._source.producer },
      { head: 'Trigger', val: event.data._source.trigger },
      { head: 'Severity', val: event.data._source.severity },
      { head: 'State Trigger Id', val: event.data._source.stateTriggerId },
      { head: 'Monitored CI Name', val: event.data._source.monitoredCIName },
      { head: 'Raised Local Timestamp', val: event.data._source.raisedLocalTimestamp },
      { head: 'Closed Timestamp', val: event.data._source.closedTimestamp },
      { head: 'Location Code', val: event.data._source.locationCode },
      { head: 'Incident Number', val: event.data._source.incidentNumber },
      { head: 'Assigned to', val: event.data._source.assignedToName }
    ];

    if (event.data._source.severity == '1') {
      this.colorval = "green"
    }
    else if (event.data._source.severity == '3') {
      this.colorval = "amber"
    }
    else if (event.data._source.severity == '4') {
      this.colorval = "red"
    }

    if (event.data._source.status == "incident" || event.data._source.status == "Incident") {
      this.alertselections = [
        { val: 'Incident', name: 'Incident' }];
    }
    else {
      this.alertselections = [
        { val: 'Assess', name: 'Assess' },
        { val: 'Incident', name: 'Incident' },
        { val: 'Invalid', name: 'Invalid' },
        { val: 'Ignore', name: 'Ignore' },
        { val: 'Closed', name: 'Closed' },
      ];

    }
  }

  onclickAsses(value, eventid, assigneename) {
    let value1 = value.toLowerCase();
    console.log(value);
    console.log(assigneename);
    var splitted = assigneename.split("|", 2); 
    if (value1 == "ignore" || value1 == "closed" || value1 == "invalid" || value1 == "incident") {
      console.log(assigneename);
      this.alertsService.putService({
        "eventId": eventid,
        "status": value,
        "assignedToName": splitted[0],
        "assignedToId": splitted[1],
      })
        .subscribe(
        result => console.log(result)
        );

      setTimeout(() => this.loadSortedAlerts(), 1000);
      this.display = false
    }

    if (value1 == "incident") {

      this.incidentService.postIncident({ "eventId": eventid })
        .subscribe(
        result => console.log(result)
        );
      setTimeout(() => this.loadSortedAlerts(), 1000);
      this.display = false
    }
    else {

    }
  }

}
