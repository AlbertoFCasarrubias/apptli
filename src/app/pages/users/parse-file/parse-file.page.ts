import { Component, OnInit } from '@angular/core';
import {UtilitiesService} from '../../../services/utilities/utilities.service';
import {Store} from '@ngxs/store';
import {UsersState} from '../../../store/states/users.state';
import {ModalController} from '@ionic/angular';
import {AnalyticsService} from '../../../services/firebase/analytics.service';

@Component({
  selector: 'app-parse-file',
  templateUrl: './parse-file.page.html',
  styleUrls: ['./parse-file.page.scss'],
})
export class ParseFilePage implements OnInit {
  text: any = '';
  text1: any = 'Ana Elizabeth García (liz)\n' +
      '\n' +
      '175\n' +
      '\n' +
      'Edad 31\n' +
      '\n' +
      '\n' +
      '\n' +
      'Antecedentes heredo familiares\n' +
      '\n' +
      'Abuelos maternos\n' +
      '\n' +
      'Abuelo vivo\n' +
      '\n' +
      'Abuela viva\n' +
      '\n' +
      '\n' +
      '\n' +
      'Abuelos paternos\n' +
      '\n' +
      'Abuelo finado no referido\n' +
      '\n' +
      'Abuela finada dm cirrosis\n' +
      '\n' +
      '\n' +
      '\n' +
      'Tíos maternos: negado\n' +
      '\n' +
      'Tíos paternos. dm\n' +
      '\n' +
      '\n' +
      '\n' +
      'Padre:  vivo ca piel, arteroesclerosis\n' +
      '\n' +
      'Madre:viva sana\n' +
      '\n' +
      'Hermanos:  negado\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      'Antecedentes personales patológicos\n' +
      '\n' +
      'Alergias: conservadores o alimentos preparados\n' +
      '\n' +
      'Medicamentos:\n' +
      '\n' +
      'Tabaquismo: + 10 al día 5\n' +
      '\n' +
      'Alcoholismo: social y ocasional\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      'Antecedentes personales patológicos\n' +
      '\n' +
      'Enfermedades: negado\n' +
      '\n' +
      'Cirugías: cesarea\n' +
      '\n' +
      'Medicamentos losartan 50 mg 1c/24 hrs am\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      'Hábitos alimenticios\n' +
      '\n' +
      'Desayuno: despierta 7:30/8 despierta cafe\n' +
      '\n' +
      'Colación matutina huevo media mañana + 1 tortilla\n' +
      '\n' +
      'Comida: 3 verduras + proteina 1 tortilla\n' +
      '\n' +
      'Colación vespertina: fruta chocolates\n' +
      '\n' +
      'Cena ocasional21.30\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '17/07/20--10/8/20--24/8/20--10/09/20--24/9/24--12/10/20--26/10/20--10/11/20\n' +
      '\n' +
      'Peso: 75.2---72.0---70--67--65--64--63.3--61.6\n' +
      '\n' +
      '%grasa ----32.6--35--30.6-- 30.3--27.6\n' +
      '\n' +
      '% agua ----------------------------\n' +
      '\n' +
      'Grasa visceral ---4--5-4--4--3\n' +
      '\n' +
      'Peso muscular ----28.4--26.7--29.1--28.7--30.1\n' +
      '\n' +
      'Edad metabólica ------29--23--21--18\n' +
      '\n' +
      'Edad ósea --------------------------\n' +
      '\n' +
      'Pecho ---93---88---88--88--86--86--86\n' +
      '\n' +
      'Cintura ---75--73---72--72--69--8-68--67\n' +
      '\n' +
      'Cadera --107--104---100--98--92--91--89\n' +
      '\n' +
      'Bd ---31--30--29--27--26--26--26\n' +
      '\n' +
      'BI ---31--30--29--27--26--26--26\n' +
      '\n' +
      'PD --66--62---60--58--55--54--54\n' +
      '\n' +
      'Pi ---66--62--58--59--57--55--54\n';
  json: any;

  constructor(private utilities: UtilitiesService,
              public modalController: ModalController,
              private analyticsService: AnalyticsService,) { }

  ngOnInit() {}

  close() {
    this.modalController.dismiss();
  }

  parseFile() {
    this.json = this.utilities.parseFile(this.text);
    this.utilities.setJSON(this.json);
    this.modalController.dismiss({
      json: this.json
    });

    this.analyticsService.sendEvent('parse', {text: this.text});

  }

}
